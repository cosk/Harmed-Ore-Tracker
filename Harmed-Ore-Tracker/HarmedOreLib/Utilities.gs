//////////////////////////////////////////////////////////////
// Locking

var DocumentLock;

/** Return true if lock was acquired, false if not */
function enterCriticalSection() {
  var docLock = DocumentLock;
  if ( docLock == null )
    docLock = LockService.getDocumentLock();
  if ( docLock == null )
    return false;
  DocumentLock = docLock;
  var gotLock = docLock.tryLock(20000);
  return gotLock;
}

function exitCriticalSection() {
  var docLock = DocumentLock;
  if ( docLock == null )
    return;
  docLock.releaseLock();
}

function isInCriticalSection() {
  var docLock = DocumentLock;
  if ( docLock == null )
    return false;
  return docLock.hasLock();
}

//////////////////////////////////////////////////////////////
// Sidebars

function showSidebar(htmlFile) {
  var html = HtmlService.createHtmlOutputFromFile(htmlFile)
      .setSandboxMode(HtmlService.SandboxMode.IFRAME);
  SpreadsheetApp.getUi().showSidebar(html);
}

function showHtmlTemplate(htmlFile, values, title) {
  var template = HtmlService.createTemplateFromFile(htmlFile);
  for ( var key in values ) {
    template[key] = values[key];
  }
  var html;
  try {
    html = template.evaluate()
    .setSandboxMode(HtmlService.SandboxMode.IFRAME);
    if ( title != null )
      html.setTitle(title);
  } catch ( e ) {
    throw "Error in " + htmlFile + ".html: " + e;
  }
  SpreadsheetApp.getUi().showSidebar(html);
}

//////////////////////////////////////////////////////////////
// HTML
function htmlEscape(str) {
    return String(str)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
}
