function cleanupOldWorlds_() {
  var now = new Date().getTime();
  var cellExpirations = {};
  // Subtract 2 from column number because our range starts from column 2 and cell number is zero-based,
  // while column number is 1-based.
  cellExpirations[Settings.runeColumn-2] = now - Settings.minutesToKeepRuneWorlds*60*1000;
  cellExpirations[Settings.unhColumn-2] = now - Settings.minutesToKeepUnhWorlds*60*1000;
  cellExpirations[Settings.addyColumn-2] = cellExpirations[Settings.mithColumn-2] = cellExpirations[Settings.coalColumn-2] =
    now - Settings.minutesToKeepHarmedWorlds*60*1000;
  
  var expiredWorlds = getExpiredWorlds_(cellExpirations);
  var worldsSheet = Settings.getWorldsSheet();
  for ( var i in expiredWorlds ) {
    var world = expiredWorlds[i];
    var worldRange = worldsSheet.getRange(world,2,1,worldsSheet.getLastColumn()-1);
    var worldRow = worldRange.getValues()[0];
    var expiredCells = getExpiredCells_(worldRow, cellExpirations);
    if ( expiredCells.length > 0 ) {
      for ( var j in expiredCells ) {
        var expiredCell = expiredCells[j];
        worldRow[expiredCell] = worldRow[expiredCell+1] = "";
      }
      worldRange.setValues([worldRow]);
    }
  }
}

function getExpiredWorlds_(cellExpirations) {
  var worldsSheet = Settings.getWorldsSheet();
  var worlds = worldsSheet.getRange(1,2,worldsSheet.getLastRow(),worldsSheet.getLastColumn()-1).getValues();
  var expiredWorlds = [];
  for ( var world in worlds ) {
    if ( getExpiredCells_(worlds[world], cellExpirations).length != 0 )
      expiredWorlds.push(parseInt(world)+1);
  }
  return expiredWorlds;
}

function getExpiredCells_(row, cellExpirations) {
  var expiredCells = [];
  for ( var cell in cellExpirations ) {
    var intCell = parseInt(cell);
    var timestamp = row[intCell+1];
    if ( timestamp instanceof Date ) {
      if ( timestamp.getTime() < cellExpirations[cell] )
        expiredCells.push(intCell);
    }
  }
  return expiredCells;
} 