var UserSettings = {
  getName: function() {
    return PropertiesService.getUserProperties().getProperty("name");
  },
  
  setName: function(name) {
    PropertiesService.getUserProperties().setProperty("name", name);
  },
  
  resetName: function() {
    PropertiesService.getUserProperties().deleteProperty("name");
  },
}
