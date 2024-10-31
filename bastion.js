// TODO: set cell sizes from layout?
// Doors and windows, furnishings

const layout = await (await fetch('./layout.json')).json();

const roomDetails = document.getElementById('room-details');
let selectedRoom = '';
let clickedRoom = '';
function SelectRoom(roomKey, click = false) {
    if (click) {
        if (clickedRoom === roomKey) roomKey = '';
        clickedRoom = roomKey;
    } else if (clickedRoom) {
            roomKey = clickedRoom;
    }
    if (selectedRoom === roomKey) return;
    if (selectedRoom) {
        roomDetails.innerHTML = '';
        for(const cell of layout.locations[selectedRoom].cells) 
            cell.classList.remove('decoration-selected')
        selectedRoom = '';
    }
    if (roomKey) {
        const loc = layout.locations[roomKey];
        const owner = loc.builder ? `<h2>Builder: ${loc.builder}<h2>` : '';
        const r = document.getElementById('room-' + loc.type)
        const rules = r ? r.innerHTML : `Missing Rules for Type ${loc.type}`;
        roomDetails.innerHTML = 
            `<h1>${loc.name}</h1>${owner}<p>${rules}</p>`;
        for(const cell of loc.cells) 
            cell.classList.add('decoration-selected');
        selectedRoom = roomKey;
    }
}

function SelectFloor(floorId) {
    for(const f of layout.floors) {
        document.getElementById(f.id).style.display = f.id === floorId ? 'block' : 'none';
        document.getElementById(`show-${f.id}`).className = f.id === floorId ? 'active' : 'none';
    }
    SelectRoom('', true);
}

function RenderLevel(floor, bastionElement, navElement) {
    function GetKey(f, r, c) {
        if (r < 0 || r >= layout.height || c < 0 || c >= layout.width)
            return '\0';
        else
            return f.grid[r][c];
    }
    const navButton = document.createElement('span');
    navButton.id = `show-${floor.id}`;
    navButton.innerText = floor.name;
    navButton.addEventListener('click', e => SelectFloor(floor.id));
    navElement.appendChild(navButton);
    const parentElement = document.createElement('div');
    parentElement.id = floor.id;
    bastionElement.appendChild(parentElement);
    const table = document.createElement('table');
    table.classList.add('floorplan');
    parentElement.appendChild(table);
    const tbody = document.createElement('tbody');
    table.appendChild(tbody);
    for(let row = 0; row < layout.height; ++row) {
        const tr = document.createElement('tr');
        tbody.appendChild(tr);
        for(let col = 0; col < layout.width; ++col) {
            const td = document.createElement('td');
            const key = GetKey(floor, row, col);
            td.dataset.location = key;
            const loc = layout.locations[key];
            if (!loc.cells) loc.cells = [];
            loc.cells.push(td);
            if (!loc) {
                console.error(`No location: ${key}`);
                return;
            }
            td.title = loc.name;
            td.style.backgroundColor = `color-mix(in srgb, ${loc.color}, white)`;
            td.style.borderColor = loc.color
            if (GetKey(floor, row - 1, col) === key) 
                td.style.borderTopStyle = 'dotted';
            if (GetKey(floor, row, col + 1) === key) 
                td.style.borderRightStyle = 'dotted';
            if (GetKey(floor, row + 1, col) === key) 
                td.style.borderBottomStyle = 'dotted';
            if (GetKey(floor, row, col - 1) === key) 
                td.style.borderLeftStyle = 'dotted';
            td.addEventListener('click', () => SelectRoom(key, true));
            td.addEventListener('mouseenter', () => SelectRoom(key));
            td.addEventListener('mouseleave', () => SelectRoom(''));
            tr.appendChild(td);
        }
    }
}

const b = document.getElementById('bastion');
const n = document.getElementById('level-select');
for(const f of layout.floors) RenderLevel(f, b, n);
SelectFloor(layout.defaultFloor);
