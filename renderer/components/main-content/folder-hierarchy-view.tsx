'use client'
import { loadGetInitialProps } from 'next/dist/shared/lib/utils';
import path from 'path';
import React, { useEffect, useMemo, useState } from 'react'

type TreeNode = {
    name: string;
    children: TreeNode[];
};

function insertPath(root: TreeNode, filePath: string) {
    const parts = filePath.split(path.sep);
    let current = root;
    for (let i = 1; i < parts.length; i++) {
        let child = current.children.find(node => node.name === parts[i]);
        if (!child) {
            child = { name: parts[i], children: [] };
            current.children.push(child);
        }

        current = child;
    }
}

export function buildTree(paths: string[]): TreeNode {
    if (paths.length === 0) throw new Error("No paths provided");

    // This will give us the largest Commun Portion of the Path
    let acc = paths[0];

    for (let i = 1; i < paths.length; ++i) {
        const min = Math.min(acc.length, paths[i].length);
        let commun = ''; 
        for(let j = 0; j < min; ++j)  {
            if(acc[j] === paths[i][j]) {
                commun += acc[j];
            }else {
                acc = commun;
                break;
            }
        }
    }
    const rootName = acc; 
    const lastRootFolder = acc.split(path.sep).pop()
    const root: TreeNode = { name: lastRootFolder, children: [] };
    for (const filePath of paths) {
        if(rootName == filePath)
            continue
        insertPath(root, filePath.replace(rootName, ''));
    }
    return root;
}

export function drawTree(head: TreeNode) {
    if(head.children.length === 0) {
        return (
            <li className='p-1'>
                {head.name}
            </li>
        )
    }
    return (
            <details open>
                <summary className='p-1'>{head.name}</summary>
                <li>
                    <ul>
                        {head.children.map((child) => drawTree(child))}
                    </ul>
                </li>
        </details>
    );
}


