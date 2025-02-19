function array_move(arr, old_index, new_index) {
  if (new_index >= arr.length) {
    var k = new_index - arr.length + 1;
    while (k--) {
      arr.push(undefined);
    }
  }
  arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
  return arr; // for testing
}

function wast() {
  fs.writeFileSync(
    processPath + "\\AppData\\data.json",
    JSON.stringify(botData, null, 2),
  );
}

setInterval(async () => {
  let presence = {};
  if (currentlyEditing == true) {
    presence.firstHeader = `Modifying Action #${lastAct} - ${botData.commands[lastObj].actions[lastAct].data.name}`;
    presence.secondHeader = `Under ${botData.commands[lastObj].name}`;
    presence.botName = botData.name;
  } else {
    presence.firstHeader = `Viewing Commands - ${botData.commands.length} Commands in total`;
    presence.secondHeader = `Highlighted: ${botData.commands[lastObj].name} - ${botData.commands[lastObj].actions.length} actions`;
    presence.botName = botData.name;
  }
  await fs.writeFileSync(
    processPath + "\\AppData\\presence.json",
    JSON.stringify(presence),
  );
  ipcRenderer.send("whatIsDoing");
}, 5000);
let lastRow;
let lastDraggedComponent;

window.oncontextmenu = function (event) {
  showCustomMenu(event.clientX, event.clientY);
  return false;
};

function copyAction(id) {
  console.log(id);
  copiedAction = botData.commands[lastObj].actions[id];
}

function showCustomMenu(x, y) {
  if (!menu) {
    menu = document.createElement("div");
    document.body.appendChild(menu);
    menu.style.width = "20vw";
    menu.style.height = "27vh";
    menu.style.backgroundColor = "#00000060";
    menu.style.borderRadius = "12px";
    menu.style.backdropFilter = "blur(12px)";
    menu.style.position = "fixed";
    menu.className = "dimension";
    menu.id = "customMenu";
    menu.style.transition = "all 0.2s ease, top 0.30s cubic-bezier(0.175, 0.885, 0.32, 1.275), left 0.30s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
    menu.style.overflowY = "auto";
    menu.style.scale = "0";
  }

  // Calculate the maximum allowed coordinates based on window dimensions
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const menuWidth = menu.offsetWidth;
  const menuHeight = menu.offsetHeight;
  const maxX = windowWidth - menuWidth;
  const maxY = windowHeight - menuHeight;
  let adjustedScale = 1;
  // Adjust the menu position if it exceeds the window boundaries
  let adjustedX = x;
  let adjustedY = y;
  if (x > maxX) {
    adjustedX = maxX;
    adjustedScale = adjustedScale - 0.1;
  }
  if (y > maxY) {
    adjustedY = maxY - 48;
    adjustedScale = adjustedScale - 0.1;
  }

  menu.style.top = adjustedY + "px";
  menu.style.left = adjustedX + "px";
  menu.style.scale = `${adjustedScale}`;
  let variableType = 2;
  menu.innerHTML = `
            <div class="sepbars noanims"></div>
            `;
  if (lastHovered) {
    if (lastHovered.id.startsWith("Group")) {
      menu.innerHTML += `
            <div class="dimension hoverablez" style="width: 95%; padding-top: 4px; padding-bottom: 4px; margin: auto; margin-bottom: 4px; margin-top: 4px; border-radius: 4px;"><div class="barbuttontexta textToLeft" style="margin-left: 1vw;">Edit Data</div></div>
            <div class="dimension hoverablez" style="width: 95%; padding-top: 4px; padding-bottom: 4px; margin: auto; margin-bottom: 4px; margin-top: 4px; border-radius: 4px;"><div class="barbuttontexta textToLeft" style="margin-left: 1vw;">Edit Actions</div></div>
            <div class="dimension hoverablez" style="width: 95%; padding-top: 4px; padding-bottom: 4px; margin: auto; margin-bottom: 4px; margin-top: 4px; border-radius: 4px;"><div class="barbuttontexta textToLeft" style="margin-left: 1vw;">Duplicate</div></div>
            `;
    }
    if (lastHovered.id.startsWith("Action")) {
      menu.innerHTML += `
            <div class="dimension hoverablez" style="width: 95%; padding-top: 4px; padding-bottom: 4px; margin: auto; margin-bottom: 4px; margin-top: 4px; border-radius: 4px;"><div class="barbuttontexta textToLeft" style="margin-left: 1vw;">Edit Data</div></div>
            <div class="dimension hoverablez" onmousedown="copyAction(${
              lastHovered.id.split("Action")[1]
            })" style="width: 95%; padding-top: 4px; padding-bottom: 4px; margin: auto; margin-bottom: 4px; margin-top: 4px; border-radius: 4px;"><div class="barbuttontexta textToLeft" style="margin-left: 1vw;">Copy</div></div>
            <div class="dimension hoverablez" onmousedown="pasteActionTo(${
              lastHovered.id.split("Action")[1]
            })" style="width: 95%; padding-top: 4px; padding-bottom: 4px; margin: auto; margin-bottom: 4px; margin-top: 4px; border-radius: 4px;"><div class="barbuttontexta textToLeft" style="margin-left: 1vw;">Paste</div></div>
            `;
    }
  }
}

function pasteActionTo(index) {
  botData.commands[lastObj].actions.push(copiedAction);
  botData.commands[lastObj].actions = moveArrayElement(
    botData.commands[lastObj].actions,
    botData.commands[lastObj].actions.length - 1,
    parseFloat(index) + 1,
  );
  wast();
  refreshActions();
}

window.oncontextmenu = function (event) {
  showCustomMenu(event.clientX, event.clientY);
  return false;
};
window.addEventListener("mousedown", function (event) {
  // Check if middle button (button number 2) is clicked
  if (event.button === 1) {
    event.preventDefault(); // Prevent default middle-click scroll behavior
  }
});
window.addEventListener("click", function (event) {
  if (menu) {
    menu.style.scale = "0";
    setTimeout(() => {
      menu.remove();
    }, 250);
    menu = null;
  }
});
function getOffset(el) {
  const rect = el.getBoundingClientRect();
  return {
    left: rect.left + window.scrollX,
    top: rect.top + window.scrollY,
  };
}
function handleKeybind(keyEvent) {
  if (keyEvent.key == "Escape") {
    if (
      document.getElementById("bottombar") == undefined ||
      document.getElementById("bottombar") == null
    ) {
      null;
    } else {
      if (document.getElementById("bottombar").style.width == "40%") {
        unmodify();
      }
      if (document.getElementById("bottombar").style.width == "100vw") {
        closeMenu();
      }
    }
  }
  if (keyEvent.key.toLowerCase() == "s" && keyEvent.ctrlKey == true) {
    if (
      document.getElementById("bottombar") == undefined ||
      document.getElementById("bottombar") == null
    ) {
      save_changes(lastAct);
    } else {
      var saveIcon = document.createElement("div");
      saveIcon.className = "image savenm goofyhovereffect";
      saveIcon.style.backgroundImage = "url(./AppData/save.gif)";
      saveIcon.style.marginTop = "-80vh";
      saveIcon.style.zIndex = "2147483647";

      saveIcon.style.width = "0vw";
      saveIcon.style.height = "8vh";
      saveIcon.style.transition = "width 0.3s ease";

      saveIcon.style.width = "0vw";

      setTimeout(() => {
        saveIcon.style.width = "8vw";

        try {
          savePrj();
        } catch (err) {
          saveIcon.remove();
        }
        document.body.appendChild(saveIcon);
        setTimeout(() => {
          saveIcon.style.width = "0vw";
          setTimeout(() => {
            saveIcon.remove();
          }, 300);
        }, 200);
      }, 300);
    }
  }
}
function closeMenu() {
  let bottombar = document.getElementById("bottombar");
  bottombar.style.animationDuration = "0.4s";
  bottombar.style.animationName = "menuExpand";
  bottombar.style.height = "";
  bottombar.style.width = "";
  bottombar.style.backdropFilter = "";
  bottombar.style.marginTop = "";
  bottombar.style.border = "";
  bottombar.style.marginLeft = "";
  bottombar.style.borderRadius = "";
  bottombar.style.backgroundColor = "";
  bottombar.style.padding = "";
  bottombar.style.paddingTop = "";
  bottombar.style.paddingBottom = "";

  setTimeout(() => {
    bottombar.onclick = () => {
      modifyBar();
    };
  }, 500);

  setTimeout(() => {
    bottombar.innerHTML = "•••";
    bottombar.style.animationName = "";
    bottombar.style.animationDuration = "";
  }, 400);
}

let aresettingsopen = false;

function initSetup() {
  aresettingsopen = true;
  let commandDisplay = document.getElementById("animationArea");
  commandDisplay.style.marginLeft = "-200vw";

  let editorOptions = document.getElementById("edutor");
  editorOptions.style.marginRight = "-200vw";

  document.body.innerHTML += `
            <div class="settingspane">

            <div class="barbuttonshift" onclick="location.reload()" style="margin-left: 1vw; margin-top: 2vh; width: 10vw;">
            <btext>Exit</btext>
            </div>


            <div  class="flexbox" style="padding: 12px; margin: auto;">

            <div class="barbuttontext" style="margin-bottom: 2vh; width: 100%;">Settings</div><br>
            <btext style="width: 100%;">Editor</btext>
            <div id="actionPreviews"></div>
            <div id="actionPreviewPosition"></div>
            <div id="actionPreviewSeparator"></div>
            <text style="width: 100%; text-align: center;">Action Preview Position can overwrite Action Separator Position</text>
    
    
            <div class="sepbarz"></div>
            <btext style="width: 100%;">Visuals</btext>
            <div id="prefferedActionPane"></div>
            <div id="coloringsmoothness"></div>
    
    
            <div class="sepbarz"></div>
            <btext style="width: 100%;">Behaviour</btext>
            <div id="changingWidth"></div>
            <div id="animationsSpeed"></div>

            <br>
            <div class="sepbarz"></div>
            <div style="margin-bottom: 0.5vh; background-color: #FFFFFF09; width: 70vw; border-radius: 12px; display: block;">
            <br>
            <div class="barbuttontext" style="font-size: 20px; width: 95%;">Bot Data</div>
            <div class="sepbars"></div>

            <div class="barbuttontexta textToLeft" style="margin-left: 3vw; margin-top: 1.5vh;">Bot Prefix</div>
            <input class="input" oninput="botData.prefix = this.value; wast()" value="${botData.prefix}">
            <div class="barbuttontexta textToLeft" style="margin-left: 3vw; margin-top: 1.5vh;">Bot Token</div>
            <input class="input" type="password" style="overflow-y: auto; overflow-x: hidden;" oninput="botData.btk = this.value; wast()" value="${botData.btk}">
            <div class="barbuttontexta textToLeft" style="margin-left: 3vw; margin-top: 1.5vh;">Client ID</div>
            <input class="input" type="number" oninput="botData.clientID = this.value; wast()" value="${botData.clientID}">
    <br>
            </div>
            </div>
            </div>
    
            `;
  createSettingSelector("actionPreviewPosition", {
    stored: "actionPreviewPosition",
    choices: ["Left", "Right", "Center"],
    name: "Action Preview Position",
  });
  createSettingSelector("actionPreviewSeparator", {
    stored: "separatorPos",
    choices: ["Right", "Left", "Both", "None"],
    name: "Action Separator Position",
  });

  createSettingSelector("prefferedActionPane", {
    stored: "subtitlePosition",
    choices: ["None", "Action Pane", "Group Pane"],
    name: "Preffered Pane",
  });
  createSettingSelector("coloringsmoothness", {
    stored: "colorsmoothness",
    choices: ["Default", "High", "Low"],
    name: "Coloring Smoothness",
  });
  createSettingSelector("changingWidth", {
    stored: "widthChanges",
    choices: ["On", "Off"],
    name: "Variable Width Effects",
  });
  createSettingSelector("animationsSpeed", {
    stored: "animations",
    choices: ["Default", "Fast", "Slow", "Relaxed", "Off"],
    name: "Animations",
  });
}
let settings;
try {
  settings = JSON.parse(
    fs.readFileSync("C:/ProgramData/EditorSettings.json", "utf8"),
  );
} catch (err) {}

if (!settings) {
  fs.writeFileSync("C:/ProgramData/EditorSettings.json", "{}");
  settings = JSON.parse(
    fs.readFileSync("C:/ProgramData/EditorSettings.json", "utf8"),
  );
}

function createSettingSelector(eID, options) {
  let element = document.getElementById(eID);
  let choices = options.choices;
  let storedAs = options.stored;

  if (!settings[storedAs] || settings[storedAs] == undefined) {
    settings[storedAs] = choices[0];
    saveSettings();
  }

  let choicesHTML = ``;

  for (let choice in choices) {
    if (settings[storedAs] == choices[choice]) {
      choicesHTML += `
                    <div class="barbuttonshift outlined" style="transition: all 0.1s ease; width: auto !important; padding: 10px; padding-left: 12px; padding-right: 12px;" onclick="setChoice('${storedAs}', '${choices[choice]}')" id="${storedAs}${choices[choice]}"><btext>${choices[choice]}</btext></div>
                    `;
    } else {
      choicesHTML += `
                    <div class="barbuttonshift" style="transition: all 0.1s ease; width: auto !important; padding-left: 12px; padding-right: 12px;" onclick="setChoice('${storedAs}', '${choices[choice]}')" id="${storedAs}${choices[choice]}"><btext>${choices[choice]}</btext></div>
                    `;
    }
  }

  element.innerHTML = `
            <div class="flexbox" style="height: 7vh; margin-bottom: 0.5vh; background-color: #FFFFFF09; width: 70vw; border-radius: 12px;"><btext style="margin-left: 1vw;">${options.name}</btext><div class="flexbox" style="margin-right: 1vw;">${choicesHTML}</div></div>
            `;
}

function setChoice(storedAs, choice) {
  document
    .getElementById(storedAs + settings[storedAs])
    .classList.remove("outlined");
  document.getElementById(storedAs + settings[storedAs]).style.padding = "";
  document.getElementById(storedAs + settings[storedAs]).style.paddingLeft =
    "12px";
  document.getElementById(storedAs + settings[storedAs]).style.paddingRight =
    "12px";

  settings[storedAs] = choice;
  document
    .getElementById(storedAs + settings[storedAs])
    .classList.add("outlined");
  document.getElementById(storedAs + settings[storedAs]).style.padding = "10px";
  document.getElementById(storedAs + settings[storedAs]).style.paddingLeft =
    "12px";
  document.getElementById(storedAs + settings[storedAs]).style.paddingRight =
    "12px";

  saveSettings();
}
function saveSettings() {
  fs.writeFileSync(
    "C:/ProgramData/EditorSettings.json",
    JSON.stringify(settings),
  );
}
function cmdOpen(cmdpending) {
  lastObj = cmdpending;
  document.getElementById("name").innerHTML = botData.commands[cmdpending].name;
}
