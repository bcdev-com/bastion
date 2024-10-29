function DisplayLevel(layout, floorName, parentElement) {
    let floor = null;
    for(const f of layout.floors)
        if (f.name === floorName) {
            floor = f;
            break;
        }
    if (!floor) return;
    function GetKey(f, r, c) {
        if (r < 0 || r >= layout.height || c < 0 || c >= layout.width)
            return '\0';
        else
            return f.grid[r][c];
    }
    let selectedKey = '';
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
            if (GetKey(floor, row - 1, col) === key) td.style.borderTopStyle = 'dotted';
            if (GetKey(floor, row, col + 1) === key) td.style.borderRightStyle = 'dotted';
            if (GetKey(floor, row + 1, col) === key) td.style.borderBottomStyle = 'dotted';
            if (GetKey(floor, row, col - 1) === key) td.style.borderLeftStyle = 'dotted';
            const f = e => {
                if (selectedKey !== key) {
                    const room = document.getElementById('room');
                    if (selectedKey) {
                        room.innerHTML = '';
                        for(const cell of layout.locations[selectedKey].cells) cell.innerText = '';
                    }
                    const owner = loc.owner ? `<h2>Builder: ${loc.owner}<h2>` : '';
                    const r = document.getElementById('room-' + loc.type)
                    const rules = r ? r.innerHTML : `Missing Rules for Type ${loc.type}`;
                    room.innerHTML = 
                        `<h1>${loc.name}</h1>${owner}<p>${rules}</p>`;
                    for(const cell of loc.cells) cell.innerText = '•';
                    selectedKey = key;
                }
            };
            td.addEventListener('tap', f);
            td.addEventListener('mouseenter', f);
            tr.appendChild(td);
        }
    }
}

const layout = await (await fetch('./layout.json')).json();
DisplayLevel(layout, 'Upper', document.getElementById('upper'));
DisplayLevel(layout, 'Ground', document.getElementById('ground'));
DisplayLevel(layout, 'Basement', document.getElementById('basement'));
if (document.location.hash === '') document.location.hash = '#ground';
