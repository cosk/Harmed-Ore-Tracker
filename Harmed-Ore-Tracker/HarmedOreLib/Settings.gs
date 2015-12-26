var Settings = {
  getHoSheet: function() {
    return SpreadsheetApp.getActive().getSheetByName("Harmed Ores");
  },

  getChatSheet: function() {
    return SpreadsheetApp.getActive().getSheetByName("Chat");
  },
  
  getWorldsSheet: function() {
    return SpreadsheetApp.getActive().getSheetByName("Worlds");
  },
  
  getIntroSheet: function() {
    return SpreadsheetApp.getActive().getSheetByName("Intro");
  },

  /** Chat version.  Change it when chat format changes to force refresh ChatUi.html. */
  chatVersion: 1,
  /** Max number of chat entries stored in the spreadsheet */
  chatRowsToKeep: 150,
  /** Number of chat entries to show in ChatUi.html */
  chatRowsToShow: 100,
    
  minutesToKeepHarmedWorlds: 10,
  minutesToKeepRuneWorlds: 55,
  minutesToKeepUnhWorlds: 55,
  
  runeColumn: 2,
  addyColumn: 6,
  mithColumn: 8,
  coalColumn: 10,
  unhColumn: 4,
}
