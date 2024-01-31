// System Variables
const UpdateClock = 1000;
const QuickUpdateClock = 100;
const debugMode = false;
let saveLoaded = false;
let mouseX = 0;
let mouseY = 0;

// Elements
const statsNavbar = document.getElementById("stats");

// Stores Structure Images
const structuresContainer = document.getElementById("structures");

// Stores Structure Buy/Sell Buttons and Objects
const marketContainer = document.getElementById("market");

// Stores Resource Information
const inventoryContainer = document.getElementById("inventory");

// Stores News String
const newsContainer = document.getElementById("news");

// Stores Hover Information
const hoverInformation = document.getElementById("hoverInformation");

// Tabs
const structuresTab = document.getElementById("structuresTab");
const marketTab = document.getElementById("marketTab");
const inventoryTab = document.getElementById("inventoryTab");

// Menus
const structuresMenu = document.getElementById("structuresMenu");
const upgradeMenu = document.getElementById("upgradesMenu");

// Variables
let money = 200;
let energy = 0;
let materials = 0;
let workers = 1;
let production = 0;
let consumption = 0;
let storage = 1000;
let username = "New Player";

let storageRemaining = storage;
let storageFull = false;
let totalResourceAmount = 0;
let totalWeight = 0;

let structurePlacing = "";
let selectedStructure = "";

let newsStrings = {};

let newsString = "";
let hoverInformationString = "";

let cursorSVG = "";

let cursor = document.createElement("div");
document.body.appendChild(cursor);
cursor.id = "cursor";

let Resources = [
  {
    name: "Wood",
    description: "A common peace of wood from a tree.",
    amount: 1,
    price: 10,
    weight: 1,
  },
  {
    name: "Bark",
    description: "A bark from a tree.",
    amount: 1,
    price: 2,
    weight: 1,
  },
];

let Structures = [
  {
    Sawmill: [
      {
        amount: 0,
        positions: [{}],
        price: 100,
        production: [
          {
            resourceName: "Wood",
            amount: 1,
          },
          {
            resourceName: "Bark",
            amount: 2,
          },
        ],
        consumption: [],
        upgrades: [
          {
            name: "Sawmill Upgrade 1",
            description: "Upgrade the sawmill to increase production.",
            price: 1000,
            production: [
              {
                resourceName: "Wood",
                amount: 2,
              },
              {
                resourceName: "Bark",
                amount: 4,
              },
            ],
            consumption: [],
            unlocked: true,
          },
        ],
        unlocked: true,
        icon: `<svg xmlns="http://www.w3.org/2000/svg"
	 width="800px" height="800px" viewBox="0 0 64 64" fill="currentColor">
<g>
	<path  d="M20,16h24c0.809,0,1.538-0.487,1.848-1.234c0.31-0.748,0.139-1.607-0.434-2.18l-12-12
		C33.023,0.195,32.512,0,32,0s-1.023,0.195-1.414,0.586l-12,12c-0.572,0.572-0.743,1.432-0.434,2.18C18.462,15.513,19.191,16,20,16z
		"/>
	<path  d="M16,28h32c0.809,0,1.538-0.487,1.848-1.234c0.31-0.748,0.139-1.607-0.434-2.18l-6.545-6.545H21.131
		l-6.545,6.545c-0.572,0.572-0.743,1.432-0.434,2.18C14.462,27.513,15.191,28,16,28z"/>
	<path  d="M28,63c0,0.553,0.447,1,1,1h6c0.553,0,1-0.447,1-1v-9h-8V63z"/>
	<path  d="M57.414,48.586L50.828,42H13.172l-6.586,6.586c-0.572,0.572-0.743,1.432-0.434,2.18
		C6.462,51.513,7.191,52,8,52h48c0.809,0,1.538-0.487,1.848-1.234C58.157,50.018,57.986,49.158,57.414,48.586z"/>
	<path  d="M12,40h40c0.809,0,1.538-0.487,1.848-1.234c0.31-0.748,0.139-1.607-0.434-2.18L46.828,30H17.172
		l-6.586,6.586c-0.572,0.572-0.743,1.432-0.434,2.18C10.462,39.513,11.191,40,12,40z"/>
</g>
</svg>`,
        color: "#5ac45a",
      },
    ],
  },
];

// Array to store all of the placed structures with their unique IDs, positions, upgrades, etc.
let StructureElements = [];

// Set Current Unique ID
function SetCurrentUniqueID() {
  // Set the current unique ID to the last structure element in the structure elements object
  const currentUniqueID = Object.keys(StructureElements).length;
  return currentUniqueID;
}

let currentUniqueID = SetCurrentUniqueID();

function AddTabEventListeners() {
  // Add Event Listeners to Tabs
  structuresTab.addEventListener("click", () => {
    switchMenu("structure");
    switchPage("structures");
  });
  marketTab.addEventListener("click", () => {
    switchPage("market");
  });
  inventoryTab.addEventListener("click", () => {
    switchPage("inventory");
  });
}

function addEventListeners() {
  AddTabEventListeners();
  document.addEventListener("mousemove", UpdateMousePositions);
}

function ColorAccentPrice() {
  // Get the price of the item element of any element with the class price and get the price using the data-price attribute and set the color of the price to green if the player has enough money to buy the item and red if the player does not have enough money to buy the item
  const priceElements = document.querySelectorAll(".price");
  priceElements.forEach((priceElement) => {
    const price = parseInt(priceElement.dataset.price);
    if (money >= price) {
      priceElement.style.color = "green";
    } else {
      priceElement.style.color = "red";
    }
  });
}

function UpdateUIElements() {
  document.getElementById("money").innerText = money;
  document.getElementById("energy").innerText = energy;
  document.getElementById("materials").innerText = materials;
  document.getElementById("workers").innerText = workers;
  document.getElementById("production").innerText = production;
  document.getElementById("consumption").innerText = consumption;
  document.getElementById("storage").innerText = totalWeight + "/" + storage;
  document.getElementById("news").innerText = newsString;
  document.getElementById("hoverInformation").innerText =
    hoverInformationString;
  ColorAccentPrice();
}

function HoverInformation(hoverInformation) {
  hoverInformationString = hoverInformation;
}

function CreateResourceElement(resource) {
  // Create the resource element if it doesn't exist
  const resourceElement = document.createElement("div");

  // Set the resource element class
  resourceElement.classList.add("resource");

  // Set the resource element id
  resourceElement.id = resource.name;

  // Set the resource element inner html
  resourceElement.innerHTML = `
        <div class="row">
          <div class="resourceTitle">${resource.name}:</div>
          <div class="resourceTitle">Storage: ${
            resource.weight * resource.amount
          }</div>
          <div class="resourceDescription">Desc: ${resource.description}</div>
          <div class="resourceAmount">Amount Owned: ${resource.amount}</div>
          <div class="resourcePrice" data-price="${
            resource.price
          }">Price Per: ${resource.price}</div>
        </div>
        <div class="row">
          <button onclick="SellResources('${resource.name}', 1)">Sell 1</button>
          <button onclick="SellResources('${
            resource.name
          }', 10)">Sell 10</button>
          <button onclick="SellResources('${
            resource.name
          }', 100)">Sell 100</button>
          <button onclick="SellResources('${
            resource.name
          }', 1000)">Sell 1000</button>
          <button onclick="SellResources('${
            resource.name
          }', 0.5)">Sell 50%</button>
          <button onclick="SellResources('${
            resource.name
          }', 'all')">Sell All</button>
          <input type="number" id="${
            resource.name
          }SellAmount" placeholder="Sell Amount">
          <button onclick="SellResources('${
            resource.name
          }', document.getElementById('${
    resource.name
  }SellAmount').value)">Sell</button>
        </div>
      `;

  return resourceElement;
}

function UpdateInventoryElements() {
  // Loop through each resource
  for (let i = 0; i < Resources.length; i++) {
    // Get the resource
    const resource = Resources[i];

    // Find the existing resource element
    const resourceElement = document.getElementById(resource.name);

    if (resourceElement) {
      // Update the resource element values
      resourceElement.querySelector(
        ".resourceAmount"
      ).textContent = `Amount Owned: ${resource.amount}`;
      resourceElement.querySelector(
        ".resourceTitle"
      ).textContent = `${resource.name}:`;
      resourceElement.querySelector(".resourceTitle").textContent = `Storage: ${
        resource.weight * resource.amount
      }`;
    } else {
      if (resource.amount > 0) {
        // Create the resource element
        const resourceElement = CreateResourceElement(resource);

        // Add the resource element to the inventory container
        inventoryContainer.appendChild(resourceElement);
      } else {
        // Remove the resource element from the inventory container
        inventoryContainer.removeChild(resourceElement);
      }

      return;
    }
  }
}

function CreateStructureMenuElement(structure) {
  // Create button element
  const buttonElement = document.createElement("button");

  // Set button text
  buttonElement.textContent = structure;

  // Set button class
  buttonElement.classList.add("structureButton");
  buttonElement.id = "structureButton" + structure;

  // Add event listener to button
  buttonElement.addEventListener("click", function () {
    BuyStructure(structure);
  });

  return buttonElement;
}

function UpdateStructuresMenu() {
  // Create button to buy each structure
  for (let i = 0; i < Structures.length; i++) {
    // Get the structure name
    const structureName = Object.keys(Structures[i])[0];

    // Check if the structure is unlocked
    if (Structures[i][structureName][0].unlocked) {
      // Check if the structure button already exists
      const structureButton = document.getElementById(
        "structureButton" + structureName
      );

      if (!structureButton) {
        // Create the structure button
        const structureButton = CreateStructureMenuElement(structureName);

        // Add the structure button to the structures menu
        structuresMenu.appendChild(structureButton);
      }
    }
  }
}

function UpdateStructuresElements() {
  // Loop through the structureElements array
  for (let i = 0; i < StructureElements.length; i++) {
    // Get the structure name
    const structureName = StructureElements[i].Structure;

    // Get the structure data
    const structure = StructureElements[i];

    // Get the positions
    const positions = structure.positions;

    // Loop through each position
    for (let j = 0; j < positions.length; j++) {
      // Get the position
      const position = positions[j];

      // Get the x and y position
      const x = position.x;
      const y = position.y;

      // Place the structure
      PlaceStructure(structureName, x, y);
    }
  }
}

function CreateUpgradeElement(upgrades, i, structureSelectedID) {
  // Create the upgrade element
  const upgradeElement = document.createElement("div");

  // Set the upgrade element class
  upgradeElement.classList.add("upgrade");

  // Set the upgrade element inner html
  upgradeElement.innerHTML = `
        <div class="row upgradeTitle">${upgrades[i].name}</div>
        <div class="row upgradeDescription">${upgrades[i].description}</div>
        <div class="row">
          <div class="row upgradePrice price" data-price="${upgrades[i].price}">Price: ${upgrades[i].price}</div>
          <button onclick="BuyUpgrade('${upgrades[i].name}', ${structureSelectedID})">Buy</button>
        </div>
      `;

  return upgradeElement;
}

function BuyUpgrade(upgradeName, structureSelectedID) {
  // Get the structure data
  const structure =
    Structures[0][StructureElements[structureSelectedID].Structure];

  // Get the upgrade data
  const upgrade = structure[0].upgrades.find((u) => u.name === upgradeName);

  // Get the upgrade price
  const upgradePrice = upgrade.price;

  // Check if the player has enough money
  if (money >= upgradePrice) {
    // Subtract the upgrade price from the player's money
    money -= upgradePrice;

    // Add the upgrade to the unique structure
    StructureElements[structureSelectedID].Upgrades.push(upgradeName);

    // Update the UI elements
    UpdateUIElements();
  } else {
    // Show a message that the player does not have enough money
    alert("You do not have enough money to purchase this upgrade.");
  }

  ShowUpgradeMenu(structureSelectedID);
}

function ShowUpgradeMenu(structureSelectedID) {
  // Get the structure element, use the structureSelectedID to get the array index and then show inside the upgrade menu (after first switching to the upgrade menu) the upgrades that the structure has, if the structure has no upgrades, show a message saying that all upgrades have been purchased, the upgrade should be linked to the structure data with the upgrade of the same name under the same structure
  upgradeMenu.innerHTML = "";
  switchMenu("upgrade");
  // Get the selected structure
  const selectedStructure = StructureElements[structureSelectedID];

  // Get the structure name
  const structureName = selectedStructure.Structure;

  // Get the structure data
  const structureData = FindStructure(structureName);

  // Get the upgrades
  const upgrades = structureData[structureName][0].upgrades;

  // Loop through the upgrades
  for (let i = 0; i < upgrades.length; i++) {
    // Check if the upgrade is already purchased
    if (!selectedStructure.Upgrades.includes(upgrades[i].name)) {
      // Check if the upgrade is unlocked
      if (upgrades[i].unlocked) {
        // Create the upgrade element
        const upgradeElement = CreateUpgradeElement(
          upgrades,
          i,
          structureSelectedID
        );

        // Add the upgrade element to the upgrade menu
        upgradeMenu.appendChild(upgradeElement);
      }
    }
  }

  // If there are no upgrades or all upgrades have been purchased, show a message
  if (
    upgrades.length === 0 ||
    selectedStructure.Upgrades.length === upgrades.length
  ) {
    upgradeMenu.innerHTML = "All upgrades have been purchased.";
  }
}

function PlaceStructure(structureName, x, y) {
  const structure = returnStructureInfo(structureName, "structure");

  // Create image element
  const structureElement = document.createElement("div");

  structureElement.innerHTML = returnStructureInfo(structureName, "icon");

  if (structure.color) {
    structureElement.querySelector("svg").style.fill = structure.color;
  }

  // Set image css position to absolute
  structureElement.style.position = "absolute";

  // Set top and left positions
  structureElement.style.top = `${y}px`;
  structureElement.style.left = `${x}px`;

  structureElement.classList.add("structure");

  // Add event listener to image
  structureElement.addEventListener("mouseover", function () {
    HoverInformation(structureName);
  });

  // Add structure to structure elements array
  StructureElements[currentUniqueID] = {
    Structure: structureName,
    Position: [
      {
        x: x,
        y: y,
      },
    ],
    Upgrades: [],
  };

  // This is to identify the unique id of the structure
  const structureUniqueID = currentUniqueID;

  // This is to identify the structure element
  structureElement.id = "structure" + structureUniqueID;

  // Add event listener to show upgrade menu
  structureElement.addEventListener("click", function () {
    // Show upgrade menu
    ShowUpgradeMenu(structureUniqueID);
  });

  // Increment the current unique ID
  currentUniqueID++;

  // Add image to structure container
  structuresContainer.appendChild(structureElement);
}

function FindStructure(structureName) {
  return Structures.find((s) => s[structureName]);
}

function UnlockStructure(structureName) {
  // Get the structure data
  const structure = FindStructure(structureName);

  // Unlock the structure
  structure[structureName][0].unlocked = true;

  // Update the structures menu
  UpdateStructuresMenu();
}

function UnlockUpgrade(structureName, upgradeName) {
  // Get the structure data
  const structure = FindStructure(structureName);

  // Get the upgrade data
  const upgrade = structure[structureName][0].upgrades.find(
    (u) => u.name === upgradeName
  );

  // Unlock the upgrade
  upgrade.unlocked = true;

  // Update the structures menu
  UpdateStructuresMenu();
}

function LockStructure(structureName) {
  // Get the structure data
  const structure = FindStructure(structureName);

  // Lock the structure
  structure[structureName][0].unlocked = false;

  // Remove the structure from the structures container
  const structureElement = document.getElementById(structureName);
  if (structureElement) {
    structuresContainer.removeChild(structureElement);
  }

  // Update the structures menu
  UpdateStructuresMenu();
}

function BuyStructure(structureName) {
  // Get the structure data
  const structure = FindStructure(structureName);

  // Get the structure price
  const structurePrice = structure[structureName][0].price;

  // Increase the structure amount
  structure[structureName][0].amount++;

  // Check if the player has enough money
  if (money >= structurePrice) {
    // Subtract the structure price from the player's money
    money -= structurePrice;

    // Update the UI elements
    UpdateUIElements();

    // Set the structure placing variable to the structure name
    structurePlacing = structureName;
  }
}

function placeStructureEventHandler() {
  // Place the structure
  PlaceStructure(structurePlacing, mouseX, mouseY);

  // Remove the event listener
  document.removeEventListener("click", placeStructureEventHandler);

  // Reset the structure placing variable
  structurePlacing = "";

  cursorSVG = "";

  CustomCursor(mouseX, mouseY);
}

function StructurePlacementManager() {
  if (structurePlacing !== "") {
    // Get the structure data
    const structure = Structures.find((s) => s[structurePlacing]);

    // Get the structure icon and set it to the cursor
    const structureIcon = structure[structurePlacing][0].icon;
    cursorSVG = structureIcon;

    // Add the event listener
    document.addEventListener("click", placeStructureEventHandler);
  }
}

function PlaceStructures() {
  // Loop through the StructureElements array
  for (let i = 0; i < StructureElements.length; i++) {
    // Get the structure data
    const structure = StructureElements[i];

    // Get the positions
    const positions = structure.Position;

    // Loop through each position
    for (let j = 0; j < positions.length; j++) {
      // Get the position
      const position = positions[j];

      // Get the structure name
      const structureName = structure.name;

      // Get the x and y position
      const x = position.x;
      const y = position.y;

      // Place the structure
      PlaceStructure(structureName, x, y);
    }
  }
}

function SellResources(resourceName, amount) {
  // Sell resources, if the amount = all, sell all, if the amount is a decimal, sell a percentage, if the amount is a number, sell that amount, if the amount selling is greater than 20% of the total amount owned, warn the user with a confirm box before selling
  const resource = Resources.find((r) => r.name === resourceName);

  if (!resource) {
    return;
  }

  if (resource) {
    // Check if the amount is all
    if (amount === "all") {
      // Set the amount to the amount owned
      amount = resource.amount;
    } else if (amount < 1) {
      // Convert the decimal to a percentage of the total amount owned and floor the decimal
      amount = Math.floor(resource.amount * amount);
    }

    // Remove any decimals
    amount = Math.floor(amount);
    // Check if the amount is greater than 20% of the amount owned
    if (amount > resource.amount * 0.2) {
      // Ask the user if they are sure they want to sell
      let amountLosingPercent = (amount / resource.amount) * 100;
      amountLosingPercent = amountLosingPercent.toFixed(2);
      const amountEarning = resource.price * amount;
      const confirmDialog = `Are you sure you want to sell this much? (${amountLosingPercent}%) of ${resourceName}. You will earn $${amountEarning}.`;
      if (confirm(confirmDialog)) {
        // Sell the amount
        resource.amount -= amount;

        // Add money
        money += resource.price * amount;
      }
    } else {
      // Sell the amount
      resource.amount -= amount;

      // Add money
      money += resource.price * amount;
    }
  }
}

function UpdateResource(resourceName, amount) {
  const resource = Resources.find((r) => r.name === resourceName);

  if (resource) {
    // Update amount
    resource.amount += amount;
  } else {
    // Create the resource
    const resource = {
      name: resourceName,
      amount: amount,
      price: 0,
      weight: 0,
    };

    // Add the resource to the resources array
    Resources.push(resource);
  }
}

function CalculateStorage() {
  let totalResources = CalculateTotalResources();
  let usedStorage = 0;
  let totalWeight = 0;

  for (let i = 0; i < totalResources.length; i++) {
    usedStorage += totalResources[i].amount * totalResources[i].weight;
  }

  let storageRemaining = storage - usedStorage;
  let isStorageFull = storageRemaining <= 0;

  for (let i = 0; i < totalResources.length; i++) {
    totalWeight += totalResources[i].weight * totalResources[i].amount;
  }

  return {
    storageRemaining,
    totalWeight,
    isStorageFull,
  };
}

function CalculateTotalProduction() {
  let totalProduction = 0;

  for (let i = 0; i < Structures.length; i++) {
    const structureName = Object.keys(Structures[i])[0];
    const structure = Structures[i][structureName][0];
    const production = structure.production;

    for (let j = 0; j < production.length; j++) {
      const p = production[j];
      const amount = p.amount * structure.amount;

      totalProduction += amount;
    }
  }

  return totalProduction;
}

function CalculateTotalConsumption() {
  let totalConsumption = 0;

  for (let i = 0; i < Structures.length; i++) {
    const structureName = Object.keys(Structures[i])[0];
    const structure = Structures[i][structureName][0];
    const consumption = structure.consumption;

    for (let j = 0; j < consumption.length; j++) {
      const c = consumption[j];
      const resourceName = Object.keys(c)[0];
      const amount = c[resourceName] * structure.amount;

      totalConsumption += amount;
    }
  }

  return totalConsumption;
}

function CalculateTotalResources() {
  let totalResources = [];

  for (let i = 0; i < Resources.length; i++) {
    const resourceName = Resources[i].name;
    const amount = Resources[i].amount;
    const price = Resources[i].price;
    const weight = Resources[i].weight;

    const resource = {
      name: resourceName,
      amount: amount,
      price: price,
      weight: weight,
    };

    totalResources.push(resource);
  }

  return totalResources;
}

function returnUpgradeProduction(structureName, upgradeName) {
  const structure = FindStructure(structureName);
  const upgrades = structure[structureName][0].upgrades;

  // Loop through each upgrade and find the upgrade with the same name
  const upgrade = upgrades.find((u) => u.name === upgradeName);

  return upgrade.production;
}

function returnUpgradeConsumption(structureName, upgradeName) {
  const structure = FindStructure(structureName);
  const upgrade = structure[structureName][0].upgrades.find(
    (u) => u.name === upgradeName
  );

  return upgrade.consumption;
}

function returnStructureInfo(structureName, informationRequesting) {
  const structure = FindStructure(structureName)[structureName][0];
  if (informationRequesting === "structure") {
    return structure;
  }
  if (informationRequesting === "production") {
    return structure.production;
  }
  if (informationRequesting === "consumption") {
    return structure.consumption;
  }
  if (informationRequesting === "upgrades") {
    return structure.upgrades;
  }
  if (informationRequesting === "price") {
    return structure.price;
  }
  if (informationRequesting === "icon") {
    return structure.icon;
  }
  if (informationRequesting === "unlocked") {
    return structure.unlocked;
  }
  if (informationRequesting === "amount") {
    return structure.amount;
  }
}

function returnStructureElementInfo(uniqueStructureID, informationRequesting) {
  const structure = StructureElements[uniqueStructureID];
  if (informationRequesting === "structure") {
    return structure;
  }
  if (informationRequesting === "positions") {
    return structure.Position;
  }
  if (informationRequesting === "upgrades") {
    return structure.Upgrades;
  }
}

function ProductionLoop() {
  // Loop through each structure element
  for (let i = 0; i < StructureElements.length; i++) {
    const structureElement = StructureElements[i];

    if (structureElement) {
      const structureName = structureElement.Structure;
      const upgrades = structureElement.Upgrades;
      const structureData = FindStructure(structureName);
      const structureAmount = structureData[structureName][0].amount;

      let structureProduction, structureConsumption;

      // Check if there are any upgrades
      if (upgrades.length > 0) {
        const lastUpgrade = upgrades[upgrades.length - 1];
        structureProduction = returnUpgradeProduction(
          structureName,
          lastUpgrade
        );

        structureConsumption = returnUpgradeConsumption(
          structureName,
          lastUpgrade
        );
      } else {
        structureProduction = returnStructureInfo(structureName, "production");

        structureConsumption = returnStructureInfo(
          structureName,
          "consumption"
        );
      }

      for (let j = 0; j < structureProduction.length; j++) {
        const production = structureProduction[j];
        const resourceName = production.resourceName;
        const amount = production.amount * structureAmount;

        UpdateResource(resourceName, amount);
      }

      for (let j = 0; j < structureConsumption.length; j++) {
        const consumption = structureConsumption[j];
        const resourceName = Object.keys(consumption)[0];
        const amount = consumption[resourceName] * structureElement.amount;

        UpdateResource(resourceName, -amount);
      }
    }
  }
}

function UpdateMousePositions(event) {
  // Get the mouse position
  const x = event.clientX;
  const y = event.clientY;

  // Update the global mouse position variables
  mouseX = x;
  mouseY = y;

  // Update the cursor position
  CustomCursor(x, y);
}

function CustomCursor(x, y) {
  // For displaying structure images when placing them
  cursor.innerHTML = cursorSVG;
  cursor.style.position = "absolute";
  cursor.style.top = `${y}px`;
  cursor.style.left = `${x}px`;
}

function switchPage(page) {
  // Switch between structures, market and inventory
  structuresContainer.style.display = page === "structures" ? "flex" : "none";
  structuresTab.classList.toggle("selected", page === "structures");
  marketContainer.style.display = page === "market" ? "flex" : "none";
  marketTab.classList.toggle("selected", page === "market");
  inventoryContainer.style.display = page === "inventory" ? "flex" : "none";
  inventoryTab.classList.toggle("selected", page === "inventory");
}

function switchMenu(page) {
  // Switch menus between structures and upgrades
  if (page === "upgrade") {
    structuresMenu.style.display = "none";
    upgradeMenu.style.display = "flex";
  } else {
    structuresMenu.style.display = "flex";
    upgradeMenu.style.display = "none";
  }
}

function manageStripes() {
  // If the storage is full, add the warning class to the stats navbar
  statsNavbar.classList.toggle("warning", storageFull);
}

function CalculateValues() {
  // Calculate the total production and consumption
  production = CalculateTotalProduction();
  consumption = CalculateTotalConsumption();

  // Calculate the storage remaining
  const storageRemainingData = CalculateStorage();
  storageRemaining = storageRemainingData.storageRemaining;
  storageFull = storageRemainingData.isStorageFull;

  // Calculate the total resource amount
  totalResourceAmount = CalculateTotalResources();

  // Calculate the total weight
  totalWeight = storageRemainingData.totalWeight;

  // Adjust storageFull based on total weight
  const maxStorageWeight = 10000; // replace with your maximum storage weight
  storageFull = totalWeight >= maxStorageWeight;
}

function Update() {
  ProductionLoop();
  CalculateValues();
  UpdateUIElements();
  manageStripes();
}

function QuickUpdate() {
  StructurePlacementManager();
  UpdateInventoryElements();
  UpdateStructuresMenu();
  UpdateUIElements();
}

function Startup() {
  addEventListeners();
  switchPage("structures");
  PlaceStructures();
  UpdateStructuresMenu();
  setInterval(Update, UpdateClock);
  setInterval(QuickUpdate, QuickUpdateClock);
}

// Ensure that the page has loaded before running the startup function
window.onload = Startup;
