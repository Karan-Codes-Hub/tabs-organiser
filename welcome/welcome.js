document.addEventListener('DOMContentLoaded', function() {
  const groupsList = document.getElementById('groupsList');
  const openSelectedBtn = document.getElementById('openSelected');
  const startFreshBtn = document.getElementById('startFresh');
  
  // Load groups
  loadGroups();
  
  openSelectedBtn.addEventListener('click', openSelectedGroups);
  startFreshBtn.addEventListener('click', startFresh);
  
  function loadGroups() {
    chrome.storage.local.get(['tabGroups'], function(result) {
      groupsList.innerHTML = '';
      const groups = result.tabGroups || {};
      
      for (const groupName in groups) {
        const groupItem = document.createElement('div');
        groupItem.className = 'group-item';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `group-${groupName}`;
        checkbox.dataset.groupName = groupName;
        
        const label = document.createElement('div');
        label.className = 'group-info';
        label.textContent = `${groupName} (${groups[groupName].length} tabs)`;
        
        groupItem.appendChild(checkbox);
        groupItem.appendChild(label);
        groupsList.appendChild(groupItem);
      }
    });
  }
  
  function openSelectedGroups() {
    const checkboxes = document.querySelectorAll('#groupsList input[type="checkbox"]:checked');
    
    // Close welcome window
    chrome.windows.getCurrent(function(currentWindow) {
      chrome.windows.remove(currentWindow.id);
    });
    
    // Close all current tabs
    chrome.tabs.query({ currentWindow: true }, function(currentTabs) {
      const tabIds = currentTabs.map(tab => tab.id);
      chrome.tabs.remove(tabIds);
    });
    
    // Open selected groups
    checkboxes.forEach(checkbox => {
      const groupName = checkbox.dataset.groupName;
      chrome.storage.local.get(['tabGroups'], function(result) {
        const groups = result.tabGroups || {};
        const tabs = groups[groupName] || [];
        
        tabs.forEach(tab => {
          chrome.tabs.create({ url: tab.url });
        });
      });
    });
  }
  
  function startFresh() {
    // Just close the welcome window
    chrome.windows.getCurrent(function(currentWindow) {
      chrome.windows.remove(currentWindow.id);
    });
  }
});