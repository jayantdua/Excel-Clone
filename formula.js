for(let i=0;i<rows;i++){
    for(let j=0;j<cols;j++){
        let cell = document.querySelector(`.cell[rid="${i}"][cid="${j}"]`);
        cell.addEventListener("blur",(e)=>{
            let address = addressBar.value;
            let [activeCell,cellProp] = getCellAndCellProp(address);
            let enteredData = activeCell.innerText;
            if(enteredData === cellProp.value){
                return;
            }
            cellProp.value = enteredData;
            // if data modified update remove P-C reln, formula empty, update children with modified value
            removeChildFromParent(cellProp.formula);
            cellProp.formula = "";
            updateChildrenCells(address);
       });
    }
}

let formulaBar = document.querySelector(".formula-bar");
formulaBar.addEventListener("keydown",async (e)=>{
    let inputFormula = formulaBar.value;
    if(e.key === "Enter" && inputFormula){
        let address = addressBar.value;
        let [cell,cellProp] = getCellAndCellProp(address);

        // if change in formula break previous reln and add new
        if(inputFormula !== cellProp.formula){
            removeChildFromParent(cellProp.formula);
        } 

        addChildToGraphComponent(inputFormula,address);
        //check if not cyclic then only evaluate
        let cycleResponse = isGraphCyclic(graphComponentMatrix);
        if(cycleResponse){
            let respose = confirm("Your formula is cyclic. Do You want to trace your path?");
            while(respose === true){
                // keep on tracking color until user is satisfied
                await isGraphCyclicTracePath(graphComponentMatrix,cycleResponse);// i want to complete full iteration of color tracking so wait here also
                respose = confirm("Your formula is cyclic. Do You want to trace your path?");
            }
            //break the relation
            removeChildFromGraphCompnent(inputFormula,address);
            return;
        }

        let evaluatedValue = evaluateFormula(inputFormula);
        setCellUIAndCellProp(evaluatedValue,inputFormula,address);
        addChildToParent(inputFormula);
        console.log(sheetDB);
        updateChildrenCells(address);
    }
});
function removeChildFromGraphCompnent(formula,childAddress){
    let [crid,ccid] = decodeRIDCIDFromAddress(childAddress);
    let encodedFormula = formula.split(" ");
    for(let i=0;i<encodedFormula.length;i++){
        let asciiValue = encodedFormula.charCodeAt(0);
        if(asciiValue >= 65 && asciiValue <=90){
            let [prid,pcid] = decodeRIDCIDFromAddress(encodedFormula[i]);
            graphComponentMatrix[prid][pcid].pop();
        }
    }
}
function addChildToGraphComponent(formula,childAddress){
    let [crid,ccid] = decodeRIDCIDFromAddress(childAddress);
    let encodedFormula = formula.split(" ");

    for(let i=0;i<encodedFormula.length;i++){
        let asciiValue = encodedFormula[i].charCodeAt(0);
        if(asciiValue >= 65 && asciiValue <=90){
            let [prid,pcid] = decodeRIDCIDFromAddress(encodedFormula[i]);
            graphComponentMatrix[prid][pcid].push([crid,ccid]);
        }
    }
}
function updateChildrenCells(parentAddress){
    let [parentCell,parentCellProp] = getCellAndCellProp(parentAddress);
    let children = parentCellProp.children;

    for(let i=0;i<children.length;i++){
        let childAddress = children[i];
        let [childCell,childCellProp] = getCellAndCellProp(childAddress);
        let childFormula = childCellProp.formula;
        let evaluatedValue = evaluateFormula(childFormula);
        setCellUIAndCellProp(evaluatedValue,childFormula,childAddress);
        updateChildrenCells(childAddress);
    }
}

function addChildToParent(formula){
    let childAddress = addressBar.value;
    let encodedFormula = formula.split(" ");
    for(let i=0;i<encodedFormula.length;i++){
        let asciiValue = encodedFormula[i].charCodeAt(0);
        if(asciiValue>=65 && asciiValue<=90){
            let[parentCell,parentCellProp] = getCellAndCellProp(encodedFormula[i]);
            parentCellProp.children.push(childAddress);
        }
    }
}
function removeChildFromParent(formula,){
    let childAddress = addressBar.value;
    let encodedFormula = formula.split(" ");
    for(let i=0;i<encodedFormula.length;i++){
        let asciiValue = encodedFormula[i].charCodeAt(0);
        if(asciiValue>=65 && asciiValue<=90){
            let[parentCell,parentCellProp] = getCellAndCellProp(encodedFormula[i]);
            let idx = parentCellProp.children.indexOf(childAddress);
            parentCellProp.children.splice(idx,1);
        }
    }
}
function evaluateFormula(formula){
    let encodedFormula = formula.split(" ");
    for(let i=0;i<encodedFormula.length;i++){
        let asciiValue = encodedFormula[i].charCodeAt(0);
        if(asciiValue >= 65 && asciiValue <=90){
            let[cell,cellProp] = getCellAndCellProp(encodedFormula[i]);
            encodedFormula[i] = cellProp.value;
        }
    }
    let decodedFromula = encodedFormula.join(" ");
    return eval(decodedFromula);
}
function setCellUIAndCellProp(evaluatedValue,formula,address){
    let [cell,cellProp] = getCellAndCellProp(address);
    //UI update
    cell.innerText = evaluatedValue;
    //DB update
    cellProp.value = evaluatedValue;
    cellProp.formula = formula;
}

