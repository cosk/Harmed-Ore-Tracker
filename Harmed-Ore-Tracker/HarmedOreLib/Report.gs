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
  DEAD   : "Mined",
  CALLED : "Called"
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
  
  if ( ores.match(/^cl(ear|r|e|ea)$/i) ) {
    for ( var i in ORE.all() ) {
      report.push(new Report(world, ORE.all()[i], ORE_STATUS.DEAD));
    }
    return report;
  }
  
  if ( ores.match(/^al(l?)$/i) ) {
    for ( var i in ORE.all() ) {
      report.push(new Report(world, ORE.all()[i], ORE_STATUS.HARMED));
    }
    return report;
  }
  
  if ( ores.match(/^(r|rune|runite)?call(ed)?$/i) ) {
    for ( var i in ORE.all() ) {
      report.push(new Report(world, ORE.RUNE, ORE_STATUS.CALLED));
    }
    return report;
  }
  
  if ( ores.match(/^(r|rune|runite)?(confirmed|conf|cnf|confirm)?$/i) ) {
    for ( var i in ORE.all() ) {
      report.push(new Report(world, ORE.RUNE, ORE_STATUS.HARMED));
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
  
  var worldsSheet = Settings.getWorldsSheet();
  var world = report.world;
  var worldRange = worldsSheet.getRange(world, 2, 1, 11);
  var worldRow = worldRange.getValues()[0];
  var oreCell = getOreCell_(report.ore);
  if ( report.ore==ORE.RUNE ) {
    var unhCell = Settings.unhColumn - 2;
    if ( report.status==ORE_STATUS.UNH ) {
      clearOre_(worldRow, oreCell);
      recordOre_(worldRow, unhCell, world, timestamp);
    } else if ( report.status==ORE_STATUS.HARMED ) {
      clearOre_(worldRow, unhCell);
      recordOre_(worldRow, oreCell, world, timestamp);
    } else if ( report.status==ORE_STATUS.DEAD ) {
      clearOre_(worldRow, oreCell);
      clearOre_(worldRow, unhCell);
    } else if ( report.status==ORE_STATUS.CALLED ) {
      if ( Math.abs(worldRow[oreCell]) == world ) {
        // Already called or confirmed, do nothing
      } else {
        clearOre_(worldRow, unhCell);
        recordOre_(worldRow, oreCell, -world, timestamp);
      }
    } else {
      throw "Internal error: unknown rune ore status " + report.status;
    }
  } else {
    if ( report.status == ORE_STATUS.HARMED ) {
      recordOre_(worldRow, oreCell, world, timestamp);
    } else if ( report.status==ORE_STATUS.DEAD ) {
      clearOre_(worldRow, oreCell);
    } else {
      throw "Internal error: unknown ore status " + report.status;
    }
  }
  worldRange.setValues([worldRow]);
}

function clearOre_(row, index) {
  row[index] = row[index+1] = "";
}

function recordOre_(row, index, world, timestamp) {
  row[index] = world;
  row[index+1] = timestamp;
}

function getOreCell_(ore) {
  var rangeOffset = 2;
  switch ( ore ) {
  case ORE.RUNE:
    return Settings.runeColumn-rangeOffset;
    break;
  case ORE.ADDY:
    return Settings.addyColumn-rangeOffset;
    break;
  case ORE.MITH:
    return Settings.mithColumn-rangeOffset;
    break;
  case ORE.COAL:
    return Settings.coalColumn-rangeOffset;
    break;
  default:
    throw "Unknown ore " + ore;
  }
}
