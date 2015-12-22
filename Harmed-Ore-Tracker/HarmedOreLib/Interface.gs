/**
 * @OnlyCurrentDoc
 */

/** Called when the user opens the spreadsheet.  Runs under identity of the user at the keyboard. */
function onOpen(e) {
  //UserSettings.resetName();  // Uncomment to reset name for testing
  createMenus_();
  startBar();
}

function createMenus_() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu("HO")
  .addItem("Settings", "HarmedOreLib.showSettings")
  .addItem("Chat", "HarmedOreLib.startBar")
  .addToUi();
}

/**
 * Show either the chat or the settings bar, depending on whether or not the user has specified the RSN.
 * Must run under the identity of the user at the keyboard (menu or onOpen event).
 */
function startBar() {
  var name = UserSettings.getName();
  if ( name==null || name=="" )
    Settings.getIntroSheet().activate();
  else
    showChat();
}

/**
 * Show the settings bar.
 * Must run under the identity of the user at the keyboard (menu, google.script.run or onOpen event).
 */
function showSettings(){
  showHtmlTemplate("UserSettingsUi.html", {nm : UserSettings.getName()}, "HO Settings");
}

function getChat(firstIndexToGet) {
  var cachedNextIndex=CacheService.getDocumentCache().get("chatIndex");
  if ( firstIndexToGet!=null && cachedNextIndex==firstIndexToGet )
    return  {nextIndex:cachedNextIndex};
  enterCriticalSection();
//  SpreadsheetApp.getActive().toast(cachedNextIndex);
  var chat = getChat_(firstIndexToGet);
  cacheChatIndex(chat.nextIndex);
  exitCriticalSection();
  return chat;
}

/**
 * Callback from UserSettingUi.html
 * Must run under the identity of the user at the keyboard (menu, google.script.run or onOpen event).
 */
function saveUserSettings(f) {
  var name = f.name.trim();
  if ( name == "" )
    throw "Name cannot be empty";
  UserSettings.setName(name);
  showChat();
  return "Name changed to " + UserSettings.getName();
}

/**
 * Show the chat bar.
 * Must run under the identity of the user at the keyboard (menu, google.script.run or onOpen event).
 */
function showChat() {
  //TODO: Try to make private, this is called only from the error handler in Chat.html
  Settings.getHoSheet().activate();
  showHtmlTemplate("ChatUi.html", {}, "HO Chat");
}

/**
 * Process report.
 * Must run under the identity of the user at the keyboard (google.script.run).
 */
function sendReport(sReport) {
  var reports = parseReport_(sReport);
  var chatSheet = Settings.getChatSheet();
  //enterCriticalSection();
  var timestamp = new Date();

  var error = "";
  if ( reports != null ) {
    for ( var i in reports ) {
      if ( reports[i].errorMsg != null ) {
        if ( error != "" )
          error += "\n";
        error += reports[i].errorMsg;
      }
      processReport_(reports[i], timestamp);
    }
  }
  
  enterCriticalSection();
  var nextRowCell = chatSheet.getRange(1,2,1,1);
  var nextRow = nextRowCell.getValue();
  var nextIndexCell = chatSheet.getRange(1,4,1,1);
  var nextIndex = nextIndexCell.getValue();
  var nextRowRange = chatSheet.getRange(nextRow,1,1,5);
  nextRowRange.setValues([[nextIndex, timestamp, UserSettings.getName(), sReport, error]]);
  nextRow = (nextRow-1)%Settings.chatRowsToKeep+2;
  nextRowCell.setValue(nextRow);
  nextIndexCell.setValue(++nextIndex);
  cacheChatIndex(nextIndex);
  exitCriticalSection();
}

function cacheChatIndex(nextIndex){
  CacheService.getDocumentCache().put("chatIndex", nextIndex, 60*10);
}

/** Remove old reports, called from a time-driven trigger */
function cleanupOldWorlds() {
  //enterCriticalSection();
  cleanupOldWorldFromCol_(Settings.runeColumn, Settings.minutesToKeepRuneWorlds);
  cleanupOldWorldFromCol_(Settings.addyColumn, Settings.minutesToKeepHarmedWorlds);
  cleanupOldWorldFromCol_(Settings.mithColumn, Settings.minutesToKeepHarmedWorlds);
  cleanupOldWorldFromCol_(Settings.coalColumn, Settings.minutesToKeepHarmedWorlds);
  cleanupOldWorldFromCol_(Settings.unhColumn, Settings.minutesToKeepUnhWorlds);
  //exitCriticalSection();
}
