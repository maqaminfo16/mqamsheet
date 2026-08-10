interface ScriptConfig {
  webhookUrl: string;
  webhookSecret: string;
  nameColumn: string;
  phoneColumn: string;
  emailColumn?: string;
  hasLastName?: boolean;
  lastNameColumn?: string;
}

export function generateAppsScript(config: ScriptConfig): string {
  return `/**
 * === نظام Maqam ===
 * الكود الخاص بـ Google Apps Script
لا تعدّل عليه
 *
 * 📌 تعليمات التثبيت:
 * 1. افتح ملف Google Sheet
 * 2. اذهب إلى: الإضافات → Apps Script
 * 3. احذف أي كود موجود والصق هذا الكود بالكامل
 * 4. اضغط حفظ (💾)
 * 5. شغّل دالة setupTrigger مرة واحدة فقط (من القائمة المنسدلة اختر setupTrigger ثم اضغط ▶️)
 * 6. وافق على الأذونات المطلوبة
 * 7. جاهز! كل صف جديد سيُرسل تلقائياً
 */

// ⚙️ إعدادات الاتصال (لا تعدّل)
var WEBHOOK_URL = '${config.webhookUrl}';
var WEBHOOK_SECRET = '${config.webhookSecret}';

// 📋 أسماء الأعمدة في الشيت
var NAME_COLUMN = '${config.nameColumn}';
var PHONE_COLUMN = '${config.phoneColumn}';
${config.emailColumn ? `var EMAIL_COLUMN = '${config.emailColumn}';` : `var EMAIL_COLUMN = ''; // لا يوجد عمود إيميل`}
${config.hasLastName ? `var LAST_NAME_COLUMN = '${config.lastNameColumn}';` : `var LAST_NAME_COLUMN = ''; // لا يوجد عمود اسم ثاني`}
var STATUS_COLUMN = 'Status'; // عمود الحالة — سيُنشأ تلقائياً

/**
 * 🔧 شغّل هذه الدالة مرة واحدة فقط لإعداد المراقبة التلقائية
 */
function setupTrigger() {
  // حذف أي triggers سابقة
  var triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(function(trigger) {
    if (trigger.getHandlerFunction() === 'onSheetChange') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  // إنشاء trigger جديد
  ScriptApp.newTrigger('onSheetChange')
    .forSpreadsheet(SpreadsheetApp.getActive())
    .onChange()
    .create();

  Logger.log('✅ تم إعداد المراقبة التلقائية بنجاح');

  // التأكد من وجود عمود Status
  ensureStatusColumn_();
}

/**
 * يتم استدعاؤها تلقائياً عند أي تغيير في الشيت
 */
function onSheetChange(e) {
  if (!e || e.changeType !== 'INSERT_ROW') return;
  processNewRows();
}

/**
 * معالجة وإرسال الصفوف الجديدة (بدون حالة)
 */
function processNewRows() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  // بناء فهرس الأعمدة
  var indexes = {};
  headers.forEach(function(h, i) { indexes[String(h).trim()] = i; });

  // التأكد من وجود عمود Status
  if (!(STATUS_COLUMN in indexes)) {
    ensureStatusColumn_();
    headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    indexes = {};
    headers.forEach(function(h, i) { indexes[String(h).trim()] = i; });
  }

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return;

  var data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();

  data.forEach(function(row, i) {
    var sheetRow = i + 2;
    var status = String(row[indexes[STATUS_COLUMN]] || '').trim();

    // تخطي الصفوف المعالجة سابقاً
    if (status) return;

    // قراءة البيانات
    var name = getValue_(row, indexes, NAME_COLUMN);
    var phone = getValue_(row, indexes, PHONE_COLUMN);

    // تخطي الصفوف الفارغة
    if (!name && !phone) return;

    var payload = {
      rowData: {}
    };

    payload.rowData[NAME_COLUMN] = name;
    payload.rowData[PHONE_COLUMN] = phone;

    if (EMAIL_COLUMN && EMAIL_COLUMN in indexes) {
      payload.rowData[EMAIL_COLUMN] = getValue_(row, indexes, EMAIL_COLUMN);
    }

    if (LAST_NAME_COLUMN && LAST_NAME_COLUMN in indexes) {
      payload.rowData[LAST_NAME_COLUMN] = getValue_(row, indexes, LAST_NAME_COLUMN);
    }

    payload.sheetName = sheet.getName();
    payload.rowNumber = sheetRow;
    payload.timestamp = new Date().toISOString();

    // إرسال للـ Webhook
    try {
      var response = UrlFetchApp.fetch(WEBHOOK_URL, {
        method: 'post',
        contentType: 'application/json',
        headers: { 'x-webhook-secret': WEBHOOK_SECRET },
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      });

      var code = response.getResponseCode();
      if (code === 200 || code === 201) {
        sheet.getRange(sheetRow, indexes[STATUS_COLUMN] + 1).setValue('Sent');
      } else {
        sheet.getRange(sheetRow, indexes[STATUS_COLUMN] + 1).setValue('Error: HTTP ' + code);
      }
    } catch (err) {
      sheet.getRange(sheetRow, indexes[STATUS_COLUMN] + 1).setValue('Error: ' + err.message);
    }
  });
}

function getValue_(row, indexes, columnName) {
  if (!(columnName in indexes)) return '';
  var val = row[indexes[columnName]];
  return val === null || val === undefined ? '' : String(val).trim();
}

function ensureStatusColumn_(sheet) {
  sheet = sheet || SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var found = headers.some(function(h) { return String(h).trim() === STATUS_COLUMN; });
  if (!found) {
    sheet.getRange(1, sheet.getLastColumn() + 1).setValue(STATUS_COLUMN);
  }
}

/**
 * 🧪 لاختبار الإرسال يدوياً — يرسل الصف الثاني فقط
 */
function sendTestRow() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var indexes = {};
  headers.forEach(function(h, i) { indexes[String(h).trim()] = i; });

  var row = sheet.getRange(2, 1, 1, sheet.getLastColumn()).getValues()[0];

  var payload = { rowData: {} };
  payload.rowData[NAME_COLUMN] = getValue_(row, indexes, NAME_COLUMN);
  payload.rowData[PHONE_COLUMN] = getValue_(row, indexes, PHONE_COLUMN);
  if (EMAIL_COLUMN) payload.rowData[EMAIL_COLUMN] = getValue_(row, indexes, EMAIL_COLUMN);
  if (LAST_NAME_COLUMN) payload.rowData[LAST_NAME_COLUMN] = getValue_(row, indexes, LAST_NAME_COLUMN);

  try {
    var response = UrlFetchApp.fetch(WEBHOOK_URL, {
      method: 'post',
      contentType: 'application/json',
      headers: { 'x-webhook-secret': WEBHOOK_SECRET },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
    SpreadsheetApp.getUi().alert('النتيجة: HTTP ' + response.getResponseCode() + '\\n\\n' + response.getContentText());
  } catch (err) {
    SpreadsheetApp.getUi().alert('خطأ: ' + err.message);
  }
}
`;
}
