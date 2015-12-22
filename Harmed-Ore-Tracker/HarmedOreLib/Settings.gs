var Settings = {
  getHoSheet: function() {
    return SpreadsheetApp.getActive().getSheetByName("Harmed Ores");
  },
  
  getMutableHoSheet: function() {
    return SpreadsheetApp.getActive().getSheetByName("HO Mutable");
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
  
  runeColumn: 1,
  addyColumn: 3,
  mithColumn: 5,
  coalColumn: 7,
  unhColumn: 9,
}
