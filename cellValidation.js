// Storage
let graphComponentMatrix = [];
let collectedGraphComponent = [];

// for(let i=0;i<rows;i++){
//     let row = [];
//     for(let j=0;j<cols;j++){
//         // why array -> More than 1 child relation(dependency)
//         row.push([])
//     }
//     graphComponentMatrix.push(row);
// }

// to denote cycle
function isGraphCyclic(graphComponentMatrix){
    //Dependency -> visited,dfsVisited
    let visited = [];
    let dfsVisited = [];
    for(let i=0;i<rows;i++){
        let visitedRow = [];
        let dfsVisitedRow = [];
        for(let j=0;j<cols;j++){
            visitedRow.push(false);
            dfsVisitedRow.push(false); 
        }
        visited.push(visitedRow);
        dfsVisited.push(dfsVisitedRow);
    }

    for(let i=0;i<rows;i++){
        for(let j=0;j<cols;j++){
            if(visited[i][j] === false)
            {
                let response = dfsCycleDetection(graphComponentMatrix,i,j,visited,dfsVisited);
                if(response == true){
                    return [i,j];
                }
            }
        }
    }
    return null;
}
// Start -> vis(true) dfsVis(true);
// End -> dfsVis(False);
// if vis[true] -> already explored path so go back no use to explore again
// cycle detection -> if(vis[i][j] == true && dfsvis[i][j] == true) -> cycle
function dfsCycleDetection(graphComponentMatrix,srcr,srcc,visited,dfsVisited){
    visited[srcr][srcc] = true;
    dfsVisited[srcr][srcc] = true;
    for(let children=0;children<graphComponentMatrix[srcr][srcc].length;children++)
    {
        let [nbrr,nbrc] = graphComponentMatrix[srcr][srcc][children];
        if(visited[nbrr][nbrc] === false){
            let response = dfsCycleDetection(graphComponentMatrix,nbrr,nbrc,visited,dfsVisited);
            if(response === true){
                return true;
            }
        }
        else if(visited[nbrr][nbrc] === true && dfsVisited[nbrr][nbrc] === true){
            return true;
        }
    }
    dfsVisited[srcr][srcc] = false;
    return false;
}