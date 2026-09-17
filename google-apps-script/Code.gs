const SPREADSHEET_ID = '18YuSMht5GMdBVgrP2XV64NPHslRPcvo6wVbhklFnilM';
const SHEETS = ['Poems', 'Stories', 'Novels', 'Chapters', 'SiteViews'];
const ADMIN_EMAIL_KEY = 'ADMIN_EMAIL';
const ADMIN_PASSWORD_KEY = 'ADMIN_PASSWORD';
const TOKEN_PREFIX = 'AUTH_';
const TOKEN_TTL_SECONDS = 86400;

function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function ss_() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function setupSheets_() {
  const ss = ss_();
  SHEETS.forEach(name => {
    if (!ss.getSheetByName(name)) {
      const sh = ss.insertSheet(name);
      if (name === 'SiteViews') sh.getRange(1,1,1,2).setValues([['id','views']]);
    }
  });
}

function headers_(sheet) {
  const lastCol = sheet.getLastColumn();
  if (!lastCol) return [];
  return sheet.getRange(1,1,1,lastCol).getValues()[0].map(String);
}

function ensureHeaders_(sheet, record) {
  let headers = headers_(sheet);
  const keys = Object.keys(record || {});
  const missing = keys.filter(k => !headers.includes(k));
  if (missing.length) {
    const start = headers.length + 1;
    sheet.getRange(1,start,1,missing.length).setValues([missing]);
    headers = headers.concat(missing);
  }
  return headers;
}

function rowsAsObjects_(sheet) {
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow < 2 || lastCol < 1) return [];
  const values = sheet.getRange(1,1,lastRow,lastCol).getValues();
  const headers = values.shift().map(String);
  return values.filter(row => row.some(v => v !== '')).map(row => {
    const o = {};
    headers.forEach((h,i) => o[h] = row[i]);
    return o;
  });
}

function normalize_(v) {
  if (v instanceof Date) return v.toISOString();
  return v;
}

function cleanRecord_(o) {
  const r = {};
  Object.keys(o || {}).forEach(k => {
    let v = normalize_(o[k]);
    if (typeof v === 'string') {
      if (v === 'TRUE') v = true;
      else if (v === 'FALSE') v = false;
    }
    r[k] = v;
  });
  return r;
}

function publicRecords_(sheetName) {
  return rowsAsObjects_(ss_().getSheetByName(sheetName)).map(cleanRecord_).filter(r => r.published === true || r.published === 'TRUE');
}

function allRecords_(sheetName) {
  return rowsAsObjects_(ss_().getSheetByName(sheetName)).map(cleanRecord_);
}

function siteViews_() {
  const sh = ss_().getSheetByName('SiteViews');
  const rows = rowsAsObjects_(sh);
  if (!rows.length) {
    sh.getRange(2,1,1,2).setValues([[1,0]]);
    return 0;
  }
  return Number(rows[0].views || 0);
}

function findRowById_(sheet, id) {
  const headers = headers_(sheet);
  const idCol = headers.indexOf('id') + 1;
  if (!idCol) return -1;
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;
  const ids = sheet.getRange(2,idCol,lastRow-1,1).getValues().flat().map(String);
  const idx = ids.indexOf(String(id));
  return idx < 0 ? -1 : idx + 2;
}

function writeRecord_(sheetName, record) {
  const sheet = ss_().getSheetByName(sheetName);
  const headers = ensureHeaders_(sheet, record);
  const row = headers.map(h => record[h] == null ? '' : record[h]);
  const existingRow = record.id ? findRowById_(sheet, record.id) : -1;
  if (existingRow > 0) sheet.getRange(existingRow,1,1,headers.length).setValues([row]);
  else sheet.appendRow(row);
  return cleanRecord_(record);
}

function deleteRecord_(sheetName, id) {
  const sheet = ss_().getSheetByName(sheetName);
  const row = findRowById_(sheet, id);
  if (row < 0) throw new Error('Record not found');
  sheet.deleteRow(row);
  return true;
}

function makeToken_() {
  const token = Utilities.getUuid() + '-' + Utilities.getUuid();
  PropertiesService.getScriptProperties().setProperty(TOKEN_PREFIX + token, String(Date.now() + TOKEN_TTL_SECONDS*1000));
  return token;
}

function validToken_(token) {
  if (!token) return false;
  const p = PropertiesService.getScriptProperties();
  const exp = Number(p.getProperty(TOKEN_PREFIX + token) || 0);
  if (!exp || Date.now() > exp) {
    if (exp) p.deleteProperty(TOKEN_PREFIX + token);
    return false;
  }
  return true;
}

function requireAuth_(body) {
  if (!validToken_(body.token)) throw new Error('Unauthorized');
}

function doGet(e) {
  try {
    setupSheets_();
    const action = String(e.parameter.action || 'all');
    if (action === 'health') return json_({ok:true});
    if (action === 'all') {
      return json_({
        ok:true,
        poems: publicRecords_('Poems'),
        stories: publicRecords_('Stories'),
        novels: publicRecords_('Novels'),
        chapters: publicRecords_('Chapters'),
        siteViews: siteViews_()
      });
    }
    return json_({ok:false,error:'Unknown action'});
  } catch (err) {
    return json_({ok:false,error:String(err.message || err)});
  }
}

function doPost(e) {
  try {
    setupSheets_();
    const body = JSON.parse(e.postData.contents || '{}');
    const action = String(body.action || '');

    if (action === 'checkAuth') {
      requireAuth_(body);
      const props = PropertiesService.getScriptProperties();
      return json_({ok:true,user:{email:props.getProperty(ADMIN_EMAIL_KEY) || '',role:'admin'}});
    }

    if (action === 'login') {
      const props = PropertiesService.getScriptProperties();
      const email = props.getProperty(ADMIN_EMAIL_KEY) || '';
      const password = props.getProperty(ADMIN_PASSWORD_KEY) || '';
      if (!email || !password) throw new Error('Admin credentials are not configured in Apps Script.');
      if (String(body.email || '').trim().toLowerCase() !== email.trim().toLowerCase() || String(body.password || '') !== password) {
        throw new Error('Invalid email or password');
      }
      return json_({ok:true, token:makeToken_(), user:{email:email, role:'admin'}});
    }

    requireAuth_(body);

    if (action === 'uploadCover') {
      const bytes = Utilities.base64Decode(String(body.base64 || ''));
      if (!bytes.length) throw new Error('No image data received');
      if (bytes.length > 8 * 1024 * 1024) throw new Error('Image is larger than 8 MB.');
      const folderName = 'Shadat Fatih Covers';
      const props = PropertiesService.getScriptProperties();
      let folderId = props.getProperty('COVERS_FOLDER_ID') || '';
      let folder;
      if (folderId) {
        try { folder = DriveApp.getFolderById(folderId); } catch (e) { folder = null; }
      }
      if (!folder) {
        const found = DriveApp.getFoldersByName(folderName);
        folder = found.hasNext() ? found.next() : DriveApp.createFolder(folderName);
        props.setProperty('COVERS_FOLDER_ID', folder.getId());
      }
      const safeName = String(body.filename || 'cover').replace(/[^a-zA-Z0-9._-]/g, '_');
      const file = folder.createFile(Utilities.newBlob(bytes, String(body.mimeType || 'image/jpeg'), safeName));
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      return json_({ok:true,url:'https://drive.google.com/uc?export=view&id=' + file.getId(),fileId:file.getId()});
    }

    if (action === 'create' || action === 'update') {
      const table = String(body.table || '');
      if (!['Poems','Stories','Novels','Chapters'].includes(table)) throw new Error('Invalid table');
      const record = Object.assign({}, body.record || {});
      if (action === 'create' && !record.id) record.id = Utilities.getUuid();
      if (action === 'create' && record.views == null) record.views = 0;
      if (action === 'create' && !record.created_at) record.created_at = new Date().toISOString();
      return json_({ok:true, record:writeRecord_(table, record)});
    }

    if (action === 'delete') {
      const table = String(body.table || '');
      if (!['Poems','Stories','Novels','Chapters'].includes(table)) throw new Error('Invalid table');
      deleteRecord_(table, String(body.id || ''));
      return json_({ok:true});
    }

    if (action === 'incrementView') {
      const table = String(body.table || '');
      if (!['Poems','Stories','Novels','Chapters'].includes(table)) throw new Error('Invalid table');
      const sheet = ss_().getSheetByName(table);
      const row = findRowById_(sheet, String(body.id || ''));
      if (row < 0) throw new Error('Record not found');
      const headers = headers_(sheet);
      let viewsCol = headers.indexOf('views') + 1;
      if (!viewsCol) {
        viewsCol = headers.length + 1;
        sheet.getRange(1,viewsCol).setValue('views');
      }
      const current = Number(sheet.getRange(row,viewsCol).getValue() || 0);
      sheet.getRange(row,viewsCol).setValue(current + 1);
      return json_({ok:true,views:current+1});
    }

    if (action === 'incrementSiteView') {
      const sh = ss_().getSheetByName('SiteViews');
      if (sh.getLastRow() < 2) sh.getRange(2,1,1,2).setValues([[1,1]]);
      else sh.getRange(2,2).setValue(Number(sh.getRange(2,2).getValue() || 0) + 1);
      return json_({ok:true,siteViews:siteViews_()});
    }

    if (action === 'adminAll') {
      return json_({ok:true,poems:allRecords_('Poems'),stories:allRecords_('Stories'),novels:allRecords_('Novels'),chapters:allRecords_('Chapters'),siteViews:siteViews_()});
    }

    return json_({ok:false,error:'Unknown action'});
  } catch (err) {
    return json_({ok:false,error:String(err.message || err)});
  }
}

function setAdminCredentials() {
  // Run this function once after replacing the two values below, then deploy the web app.
  const email = 'YOUR_ADMIN_EMAIL';
  const password = 'CHANGE_THIS_TO_A_STRONG_PASSWORD';
  if (email === 'YOUR_ADMIN_EMAIL' || password === 'CHANGE_THIS_TO_A_STRONG_PASSWORD') {
    throw new Error('Edit setAdminCredentials() first.');
  }
  PropertiesService.getScriptProperties().setProperties({
    [ADMIN_EMAIL_KEY]: email,
    [ADMIN_PASSWORD_KEY]: password
  }, true);
}
