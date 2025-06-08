document.addEventListener('DOMContentLoaded', function() {
  // DOM elements
  const groupNameInput = document.getElementById('groupName');
  const createGroupBtn = document.getElementById('createGroup');
  const groupsList = document.getElementById('groupsList');
  const saveCurrentBtn = document.getElementById('saveCurrent');
  const manageGroupsBtn = document.getElementById('manageGroups');
  const manageModal = document.getElementById('manageModal');
  const closeModalBtn = document.getElementById('closeModal');
  
  // Initialize
  loadGroups();
  
  // Event listeners
  createGroupBtn.addEventListener('click', createGroup);
  saveCurrentBtn.addEventListener('click', saveCurrentTabs);
  manageGroupsBtn.addEventListener('click', openManageModal);
  closeModalBtn.addEventListener('click', closeManageModal);
  
  // Close modal when clicking outside
  manageModal.addEventListener('click', function(e) {
    if (e.target === manageModal) {
      closeManageModal();
    }
  });
  
  // Load groups from storage
  function loadGroups() {
    chrome.storage.local.get(['tabGroups'], function(result) {
      groupsList.innerHTML = '';
      const groups = result.tabGroups || {};
      
      if (Object.keys(groups).length === 0) {
        groupsList.innerHTML = `
          <div class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 3V5M15 3V5M9 19V21M15 19V21M5 9H3M5 15H3M21 9H19M21 15H19M7 19H17C18.1046 19 19 18.1046 19 17V7C19 5.89543 18.1046 5 17 5H7C5.89543 5 5 5.89543 5 7V17C5 18.1046 5.89543 19 7 19Z" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <p>No groups yet</p>
            <small>Create your first group to get started</small>
          </div>
        `;
        return;
      }
      
      for (const groupName in groups) {
        addGroupToUI(groupName, groups[groupName].length);
      }
    });
  }
  
  // Add group to the UI list
  function addGroupToUI(groupName, tabCount) {
    const emptyState = groupsList.querySelector('.empty-state');
    if (emptyState) {
      groupsList.removeChild(emptyState);
    }
    
    const groupItem = document.createElement('div');
    groupItem.className = 'group-item';
    groupItem.innerHTML = `
      <span>${groupName}</span>
      <span class="group-count">${tabCount} tab${tabCount !== 1 ? 's' : ''}</span>
    `;
    groupItem.dataset.groupName = groupName;
    
    groupItem.addEventListener('click', function() {
      openGroup(groupName, false); // false = don't close window
    });
    
    groupsList.appendChild(groupItem);
  }
  
  // Create new group with an empty tab
  function createGroup() {
    const groupName = groupNameInput.value.trim();
    if (!groupName) return;
    
    chrome.storage.local.get(['tabGroups'], function(result) {
      const groups = result.tabGroups || {};
      
      if (!groups[groupName]) {
        // Initialize with an empty tab
        groups[groupName] = [{
          url: 'https://www.google.com',
          title: 'New Tab'
        }];
        
        chrome.storage.local.set({ tabGroups: groups }, function() {
          groupNameInput.value = '';
          loadGroups();
        });
      } else {
        alert('Group already exists!');
      }
    });
  }
  
  // Save current tabs to a group
  function saveCurrentTabs() {
    chrome.tabs.query({ currentWindow: true }, function(tabs) {
      const groupName = prompt('Enter group name to save to:');
      if (!groupName) return;
      
      const tabData = tabs.map(tab => ({
        url: tab.url,
        title: tab.title
      }));
      
      chrome.storage.local.get(['tabGroups'], function(result) {
        const groups = result.tabGroups || {};
        groups[groupName] = tabData;
        chrome.storage.local.set({ tabGroups: groups }, function() {
          loadGroups();
        });
      });
    });
  }
  
  // Open group (with option to keep window open)
function openGroup(groupName, closeWindow = true) {
    chrome.storage.local.get(['tabGroups'], function(result) {
        const groups = result.tabGroups || {};
        const tabs = groups[groupName] || [];
        
        if (tabs.length === 0) {
            alert('This group has no tabs to open!');
            return;
        }
        
        // Convert all tabs to URLs - empty URLs will become "about:blank"
        const urls = tabs.map(tab => tab.url || '');
        
        // Create new window for these tabs
        chrome.windows.create({ url: urls }, function() {
            if (closeWindow) {
                closeManageModal();
            }
        });
    });
}
  
  // Open management modal
  function openManageModal() {
    manageModal.style.display = 'flex';
    loadGroupsToManage();
  }
  
  // Close management modal
  function closeManageModal() {
    manageModal.style.display = 'none';
  }
  
  // Load groups into management modal
  function loadGroupsToManage() {
    chrome.storage.local.get(['tabGroups'], function(result) {
      const container = document.getElementById('groupsToManage');
      container.innerHTML = '';
      
      const groups = result.tabGroups || {};
      
      if (Object.keys(groups).length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 3V5M15 3V5M9 19V21M15 19V21M5 9H3M5 15H3M21 9H19M21 15H19M7 19H17C18.1046 19 19 18.1046 19 17V7C19 5.89543 18.1046 5 17 5H7C5.89543 5 5 5.89543 5 7V17C5 18.1046 5.89543 19 7 19Z" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <p>No groups to manage</p>
          </div>
        `;
        return;
      }
      
      for (const groupName in groups) {
        const groupItem = document.createElement('div');
        groupItem.className = 'group-manage-item';
        
        groupItem.innerHTML = `
          <div class="group-manage-item-header">
            <span class="group-name">${groupName}</span>
            <span class="group-tab-count">${groups[groupName].length} tab${groups[groupName].length !== 1 ? 's' : ''}</span>
          </div>
          <div class="group-actions">
            <button class="open-btn" data-group="${groupName}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 12V20H18V12M12 3V16M12 16L8 12M12 16L16 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Open
            </button>
            <button class="add-btn" data-group="${groupName}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              Add Tabs
            </button>
            <button class="rename-btn" data-group="${groupName}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 5H6C4.89543 5 4 5.89543 4 7V18C4 19.1046 4.89543 20 6 20H17C18.1046 20 19 19.1046 19 18V13M17.5858 3.58579C18.3668 2.80474 19.6332 2.80474 20.4142 3.58579C21.1953 4.36683 21.1953 5.63316 20.4142 6.41421L11.8284 15H9V12.1716L17.5858 3.58579Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Rename
            </button>
            <button class="delete-btn" data-group="${groupName}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Delete
            </button>
          </div>
        `;
        
        container.appendChild(groupItem);
      }
      
      // Add event listeners to all action buttons
      document.querySelectorAll('.open-btn').forEach(btn => {
        btn.addEventListener('click', () => openGroup(btn.dataset.group));
      });
      
      document.querySelectorAll('.add-btn').forEach(btn => {
        btn.addEventListener('click', () => addTabsToGroup(btn.dataset.group));
      });
      
      document.querySelectorAll('.rename-btn').forEach(btn => {
        btn.addEventListener('click', () => renameGroup(btn.dataset.group));
      });
      
      document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteGroup(btn.dataset.group));
      });
    });
  }
  
  // Add tabs to existing group
  function addTabsToGroup(groupName) {
    chrome.tabs.query({ currentWindow: true }, function(tabs) {
      const tabData = tabs.map(tab => ({
        url: tab.url,
        title: tab.title
      }));
      
      chrome.storage.local.get(['tabGroups'], function(result) {
        const groups = result.tabGroups || {};
        if (groups[groupName]) {
          // Merge new tabs with existing ones, avoiding duplicates
          const existingUrls = new Set(groups[groupName].map(tab => tab.url));
          const newTabs = tabData.filter(tab => !existingUrls.has(tab.url));
          
          groups[groupName] = groups[groupName].concat(newTabs);
          chrome.storage.local.set({ tabGroups: groups }, function() {
            alert(`Added ${newTabs.length} new tabs to "${groupName}"`);
            loadGroupsToManage();
            loadGroups();
          });
        }
      });
    });
  }
  
  // Rename group
  function renameGroup(oldName) {
    const newName = prompt('Enter new name for group:', oldName);
    if (newName && newName !== oldName) {
      chrome.storage.local.get(['tabGroups'], function(result) {
        const groups = result.tabGroups || {};
        if (groups[oldName]) {
          groups[newName] = groups[oldName];
          delete groups[oldName];
          chrome.storage.local.set({ tabGroups: groups }, function() {
            loadGroupsToManage();
            loadGroups();
          });
        }
      });
    }
  }
  
  // Delete group
  function deleteGroup(groupName) {
    if (confirm(`Are you sure you want to delete "${groupName}"?`)) {
      chrome.storage.local.get(['tabGroups'], function(result) {
        const groups = result.tabGroups || {};
        delete groups[groupName];
        chrome.storage.local.set({ tabGroups: groups }, function() {
          loadGroupsToManage();
          loadGroups();
        });
      });
    }
  }
});