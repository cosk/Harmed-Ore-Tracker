var ORE = {
  RUNE : "Runite",
  ADDY : "Adamantite",
  MITH : "Mithril",
  COAL : "Coal",
  
  all : function() { return [ORE.RUNE, ORE.ADDY, ORE.MITH, ORE.COAL]; },
};

var ORE_STATUS = {
  HARMED : "Harmonised",
  UNH    : "Unharmed",
  DEAD   : "Mined"
}

function Report(world, ore, status, error) {
  this.world = world;
  this.ore = ore;
  this.status = status;
  this.errorMsg = error;
  
  this.toString = function() {
    var s;
    if ( this.errorMsg != null )
      s = this.errorMsg;
    else
      s = this.world + " " + this.ore + " " + this.status;
    return s;
  }
}

function reportError(world, error) {
  return new Report(world, null, null, error);
}

//TODO: kill
function testParse() {
  var r = parseReport_("100 u only");
  return;
}

function parseReport_(sReport) {
  var reports = [];
  var rest = sReport.replace(/\s+/g, "");
  while ( rest.length > 0 ) {
    var match = rest.match(/^(?:w?)(\d+)(\D+)(.*)/i);
    if ( match == null )
      return reports;
    var world = match[1];
    var ores = match[2];
    rest = match[3];
    var worldsSheet = Settings.getWorldsSheet();
    if ( world > worldsSheet.getLastRow() ) {
      reports.push(reportError(world, world+": world number is too large"));
      continue;
    }
    var worldType = worldsSheet.getRange(world, 1, 1, 1).getValue();
    if ( worldType==null || worldType.toUpperCase().indexOf("M")==-1 ) {
      reports.push(reportError(world, world+" is not a members world"));
      continue;
    }
    if ( worldType.toUpperCase()!="M" ) {
      reports.push(reportError(world, world+" is a foreign world"));
      continue;
    }
    var report = parseWorldReport(world, ores);
    if ( report == null )
      break;
    for ( var w in report )
      reports.push(report[w]);
  }
  return reports;
}

function parseWorldReport(world, ores) {
  var report = [];
  
  if ( ores.match(/^clear$/i) ) {
    for ( var i in ORE.all() ) {
      report.push(new Report(world, ORE.all()[i], ORE_STATUS.DEAD));
    }
    return report;
  }
  
  if ( ores.match(/^all$/i) ) {
    for ( var i in ORE.all() ) {
      report.push(new Report(world, ORE.all()[i], ORE_STATUS.HARMED));
    }
    return report;
  }

  var deadRuneMatch = ores.match(/^(?:d|dead|mine|mined)(.*)/i);
  if ( deadRuneMatch != null ) {
    report.push(new Report(world, ORE.RUNE, ORE_STATUS.DEAD));
    var rest = deadRuneMatch[1];
  } else {
    rest = ores;
  }
  
  while ( rest.length > 0 ) {
    var unhMatch = rest.match(/^(?:(?:r|rune|runite)?(?:u|unh))(.*)/i);
    if ( unhMatch != null ) {
      report.push(new Report(world, ORE.RUNE, ORE_STATUS.UNH));
      rest = unhMatch[1];
      continue;
    }
    
    var match = rest.match(/^((?:r|rune|runite)|(?:a|addy|adamantite)|(?:m|mith|mithril)|(?:c|coal))(?:(d|dead|mine|mined)?)(.*)/i);
    if ( match == null )
      break;
    var oreName = match[1].toLowerCase();
    var ore;
    switch ( oreName.charAt(0) ) {
    case "r":
      ore = ORE.RUNE;
      break;
    case "a":
      ore = ORE.ADDY;
      break;
    case "m":
      ore = ORE.MITH;
      break;
    case "c":
      ore = ORE.COAL;
      break;
    }
    
    var oreStatus = match[2]!=null ? ORE_STATUS.DEAD : ORE_STATUS.HARMED;
    report.push(new Report(world, ore, oreStatus));
    rest = match[3];
  }
  
  if ( rest.match(/^only$/i) ) {
    var otherOres = {};
    for ( var i in ORE.all() ) {
      otherOres[ORE.all()[i]] = true;
    }
    for ( var i in report ) {
      otherOres[report[i].ore] = false;
    }
    for ( var ore in otherOres ) {
      if ( otherOres[ore] )
        report.push(new Report(world, ore, ORE_STATUS.DEAD));
    }
  }

  return report;
}

function processReport_(report, timestamp) {
  if ( report.errorMsg != null )
    return;
  if ( report.ore==ORE.RUNE ) {
    if ( report.status==ORE_STATUS.UNH ) {
      removeFromCol_(Settings.runeColumn, report.world);
      addToCol_(Settings.unhColumn, report.world, timestamp);
    } else if ( report.status==ORE_STATUS.HARMED ) {
      removeFromCol_(Settings.unhColumn, report.world);
      addToCol_(Settings.runeColumn, report.world, timestamp);
    } else {
      removeFromCol_(Settings.unhColumn, report.world);
      removeFromCol_(Settings.runeColumn, report.world);
    }
    return;
  }
  var col = getOreColumn_(report.ore);
  
  if ( report.status == ORE_STATUS.HARMED ) {
    addToCol_(col, report.world, timestamp);
  } else {
    removeFromCol_(col, report.world);
  }
}

function addToCol_(col, world, timestamp) {
  var range = getOreRange_(col, 1);
  var values = range.getValues();
  removeFromRangeValues_(values, world);
  var newRow = [world, timestamp];
  values.splice(0, 0, newRow);
  values.pop();
  range.setValues(values);
}

function removeFromCol_(col, world) {
  var range = getOreRange_(col, 0);
  var values = range.getValues();
  var removed = removeFromRangeValues_(values, world);
  if ( removed )
    range.setValues(values);
}

function removeFromRangeValues_(values, world) {
  if ( values==null || values.length==0 )
    return false;
  var j = 0;
  for ( var i in values ) {
    if ( values[i][0] == world )
      continue;
    if ( i != j )
      values[j] = values[i];
    ++j;
  }

  return fillValues_(values, j);
}

function cleanupOldWorldFromCol_(col, minutes) {
  var range = getOreRange_(col, 0);
  var values = range.getValues();
  if ( cleanupOldWorldsFromValues_(values, minutes) )
    range.setValues(values);
}

function cleanupOldWorldsFromValues_(values, minutes) {
  var now = new Date().getTime();
  var expiration = now - minutes*60*1000;
  if ( values==null || values.length==0 )
    return false;
  var j = 0;
  for ( var i in values ) {
    var timestamp = values[i][1];
    if ( timestamp!="" && timestamp.getTime()<expiration )
      continue;
    if ( i != j )
      values[j] = values[i];
    ++j;
  }
  return fillValues_(values, j);
}

function fillValues_(values, startFrom) {
  if ( values==null || startFrom>=values.length )
    return false;
  var filler = [];
  for ( var i = 0 ; i < values[0].length ; ++i )
    filler.push("");
  for ( var i = startFrom ; i < values.length ; ++i )
    values[i] = filler;
  return true;
}

function getOreColumn_(ore) {
  switch ( ore ) {
  case ORE.RUNE:
    return Settings.runeColumn;
    break;
  case ORE.ADDY:
    return Settings.addyColumn;
    break;
  case ORE.MITH:
    return Settings.mithColumn;
    break;
  case ORE.COAL:
    return Settings.coalColumn;
    break;
  default:
    throw "Unknown ore " + ore;
  }
  return col;
}

function getOreRange_(col, extraRows) {
  var hoSheet = Settings.getMutableHoSheet();
  var startRow = 1;
  var rowCount = Math.max(hoSheet.getLastRow()-startRow+1+extraRows, 1);
  //SpreadsheetApp.getActive().toast("getOreRange: " + rowCount);
  return hoSheet.getRange(startRow, col, rowCount, 2);
}
