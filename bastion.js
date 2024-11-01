// TODO: Set cell sizes from layout
//       Doors and windows, furnishings

const bastion = await (await fetch('./bastion.json')).json();
const roomDetails = document.getElementById('room-details');
const rulesList = document.getElementById('rules-list').content;
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
        for(const cell of bastion.locations[selectedRoom].cells) 
            cell.classList.remove('decoration-selected')
        selectedRoom = '';
    }
    if (roomKey) {
        const loc = bastion.locations[roomKey];
        const r = loc.type ? rulesList.querySelector('#room-' + loc.type) : false;
        const owner = loc.builder ? `<div><b>Builder:</b> ${loc.builder}</div>` : '';
        const size = r ? `<div><b>Size:</b> ${loc.cells.length} squares</div>` : '';
        const rules = r ? `<div id='rules'><h2>Rules</h2><p>${r.innerHTML}</p></div>` : '';
        let desc = '';
        if (loc.description) {
            for(const d of loc.description) desc += `<p>${d}</p>`;
        }
        let hirelings = '';
        if (loc.hirelings) {
            hirelings += '<h3>Hirelings:</h3><ul>';
            for(const h of loc.hirelings) hirelings += `<li>${h}</li>`;
            hirelings += '</ul>';
        }
        roomDetails.innerHTML = `<h2>${loc.name}</h2>${desc}${size}${owner}${hirelings}${rules}`;
        for(const cell of loc.cells) 
            cell.classList.add('decoration-selected');
        selectedRoom = roomKey;
    }
}

function SelectFloor(floorId) {
    for(const f of bastion.floors) {
        document.getElementById(f.id).style.display = f.id === floorId ? 'block' : 'none';
        document.getElementById(`show-${f.id}`).className = f.id === floorId ? 'active' : 'none';
    }
    SelectRoom('', true);
}

function RenderFloor(floor, bastionElement, navElement) {
    function GetKey(f, r, c) {
        if (r < 0 || r >= bastion.height || c < 0 || c >= bastion.width)
            return '\0';
        else
            return f.grid[r][c];
    }
    function OnClick(e) {
        SelectRoom(e.target.dataset.location, true);
    }
    function OnEnter(e) {
        SelectRoom(e.target.dataset.location);
    }
    function OnLeave(e) {
        SelectRoom('');
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
    table.classList.add('floor');
    parentElement.appendChild(table);
    const tbody = document.createElement('tbody');
    table.appendChild(tbody);
    for(let row = 0; row < bastion.height; ++row) {
        const tr = document.createElement('tr');
        tbody.appendChild(tr);
        for(let col = 0; col < bastion.width; ++col) {
            const td = document.createElement('td');
            const key = GetKey(floor, row, col);
            td.dataset.location = key;
            const loc = bastion.locations[key];
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
            td.addEventListener('click', OnClick);
            td.addEventListener('mouseenter', OnEnter);
            td.addEventListener('mouseleave', OnLeave);
            tr.appendChild(td);
        }
    }
}

document.getElementById('bastion-name').innerText = document.title = bastion.name
const b = document.getElementById('bastion');
const s = document.getElementById('floor-select');
for(const f of bastion.floors) RenderFloor(f, b, s);
SelectFloor(bastion.defaultFloor);
