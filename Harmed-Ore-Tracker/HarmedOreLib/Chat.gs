function getChat_(firstIndexToGet) {
  var chatSheet = Settings.getChatSheet();
  var nextIndexCell = chatSheet.getRange(1,4,1,1);
  var nextIndex = nextIndexCell.getValue();
  
  var chat = [];
  var keepIndex = Math.max(nextIndex-Settings.chatRowsToShow, 1);
  var chatData = {version:Settings.chatVersion, nextIndex:nextIndex, keepIndex:keepIndex, chat:chat};
  
  if ( firstIndexToGet==null || firstIndexToGet>nextIndex )
    firstIndexToGet = 1;
  
  if ( firstIndexToGet==nextIndex ) {
    // Shortcut for common case
    return chatData;
  }
  
  firstIndexToGet = Math.max(keepIndex, firstIndexToGet);
  
  var nextRowCell = chatSheet.getRange(1,2,1,1);
  var nextRow = nextRowCell.getValue();
  
  var rowOffet = nextIndex-nextRow+2;
  
  var chatRange = chatSheet.getRange(2,1,Settings.chatRowsToKeep,5);
  var chatTable = chatRange.getValues();
  
  for ( var i = firstIndexToGet ; i < nextIndex ; ++i ) {
    var row = (i-rowOffet)%Settings.chatRowsToKeep;
    if ( row < 0 )
      row += Settings.chatRowsToKeep;
    var sheetRow = chatTable[row];
    // google.script.run does not support Date class
    var outRow = [sheetRow[0], sheetRow[1].getTime(), htmlEscape(sheetRow[2]), htmlEscape(sheetRow[3]), htmlEscape(sheetRow[4])];
    chat.push(outRow);
  }

  return chatData;
}
