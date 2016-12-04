define([
    
], function() {
    var nodeHelper = {
        nodeGeos: [
            [],
            [
                [1 / 2, 1 / 2, 0, Math.PI * 2]
            ],
            [
                [1 / 4, 1 / 2, Math.PI / 2, Math.PI * 3 / 2],
                [3 / 4, 1 / 2, -Math.PI / 2, Math.PI / 2]
                /*[1 / 4, 1 / 2, 0, Math.PI * 2],
                [3 / 4, 1 / 2, 0, Math.PI * 2]*/
            ],
            [
                [1 / 2, 1 / 3, 0, Math.PI * 2],
                [1 / 3, 2 / 3, 0, Math.PI * 2],
                [2 / 3, 2 / 3, 0, Math.PI * 2]
            ],
            [
                [1 / 2, 1 / 2, 0, Math.PI * 2],
                [1 / 4, 1 / 4, 0, Math.PI * 2],
                [3 / 4, 1 / 4, 0, Math.PI * 2],
                [1 / 2, 3 / 4, 0, Math.PI * 2]
            ],
            [
                [1 / 2, 1 / 2, 0, Math.PI * 2],
                [1 / 4, 1 / 4, 0, Math.PI * 2],
                [3 / 4, 1 / 4, 0, Math.PI * 2],
                [1 / 4, 3 / 4, 0, Math.PI * 2],
                [3 / 4, 3 / 4, 0, Math.PI * 2]
            ]
        ],
        /**
         * 计算节点坐标位置
         * @param  {[type]} categories [description]
         * @param  {[type]} nodes      [description]
         * @param  {[type]} links      [description]
         * @param  {[type]} width      [description]
         * @param  {[type]} height     [description]
         * @param  {[type]} radius     [description]
         * @return {[type]}            [description]
         */
        renderNodeGeo: function(categories, nodes, links, width, height, radius) {
            var selectedCateogoryLen = _.filter(categories, function(category) {
                    return category.selected
                }).length,
                geoArr = this.nodeGeos[selectedCateogoryLen],
                geoIndex = 0;

            categories.forEach(function(category, index) {
                if (!category.selected) return;
                var x = geoArr[geoIndex][0] * width,
                    y = geoArr[geoIndex][1] * height,
                    startArc = geoArr[geoIndex][2],
                    endArc = geoArr[geoIndex][3];

                var rootNode = getRootNode(index);
                rootNode.x = x;
                rootNode.y = y;
                geoIndex += 1;
                var nextNodes = getNextNodes(index, rootNode.id);

                if (nextNodes && nextNodes.length > 0) {
                    renderNextNodesGeo(index, rootNode, nextNodes, startArc, endArc, radius);
                }
            })

            function getRootNode(categoryId) {
                var rootNode = _.find(nodes, function(node) {
                    return node.category == categoryId && node.person == null;
                });
                return rootNode;
            }

            function getNextNodes(categoryId, id) {
                var ids = _.filter(links, function(link) {
                    return link.source == id && link.category == categoryId;
                }).map(function(link) {
                    return link.targetNode.id;
                });

                return _.filter(nodes, function(node) {
                    return ids.indexOf(node.id) > -1;
                })
            }

            function renderNextNodesGeo(categoryId, parentNode, nextNodes, startArc, endArc, radius) {
                /*nextNodes = _.filter(nextNodes, function(nextNode) {
                    return !(nextNode.x || nextNode.y);
                })*/

                var hasChildNodes = [],
                    hasNotChildNodes = [];
                nextNodes.forEach(function(nextNode, index) {
                    nextNode.NextNodes = getNextNodes(categoryId, nextNode.id) || [];
                    nextNode.NextNodesLength = nextNode.NextNodes.length;

                    if (nextNode.NextNodesLength > 0) {
                        nextNode.radius = radius * 2;
                        hasChildNodes.push(nextNode);
                    } else {
                        nextNode.radius = radius * 0.6;
                        hasNotChildNodes.push(nextNode);
                    }
                })
                var nodeLen = hasChildNodes.length,
                    arcLen = endArc - startArc,
                    interval = arcLen / nodeLen,
                    curPi = startArc;


                //有子节点的节点布局
                for (var i = 0; i < nodeLen; i++) {
                    curPi += interval;

                    var curNode = hasChildNodes[i],
                        cx = parentNode.x,
                        cy = parentNode.y,
                        nodeX = cx + Math.cos(curPi) * curNode.radius,
                        nodeY = cy + Math.sin(curPi) * curNode.radius;
                    curNode.x = nodeX;
                    curNode.y = nodeY;

                    var childR = radius;
                    childR = childR > 0 ? childR : 1;
                    var arcLen = interval / 2 + Math.asin(radius / childR * Math.sin(interval / 2));
                    var childStartArc = curPi - (arcLen - interval) / 2,
                        childEndArc = childStartArc + arcLen - (arcLen - interval) / 2;

                    renderNextNodesGeo(categoryId, curNode, curNode.NextNodes, childStartArc, childEndArc, childR);

                    delete curNode.NextNodes;
                }

                nodeLen = hasNotChildNodes.length;
                arcLen = hasChildNodes.length > 0 ? Math.PI * 2 : (endArc - startArc);
                interval = arcLen / nodeLen;


                //begin
                curPi = hasChildNodes.length > 0 ? 0 : startArc;
                //半径
                var cRadius = radius * 0.6;
                //周长
                var c = Math.PI * 2 * cRadius;
                var cSymbolSize = 12;
                //周长内可布局的点的个数

                var cNodeLen = Math.ceil(c / cSymbolSize);

                if (cNodeLen >= nodeLen) {
                    cNodeLen = nodeLen;
                }
                var bNodeLen = cNodeLen;
                interval = arcLen / cNodeLen;

                //无子节点的布局
                for (var i = 0; i < nodeLen; i++) {
                    if (cNodeLen == 0) {
                        cRadius += cSymbolSize;
                        c = Math.PI * 2 * cRadius;
                        cNodeLen = Math.ceil(c / cSymbolSize);
                        if (cNodeLen >= nodeLen - i - 1) {
                            cNodeLen = nodeLen - i - 1;
                        }
                        interval = arcLen / cNodeLen;
                    }
                    curPi += interval;

                    var curNode = hasNotChildNodes[i],
                        cx = parentNode.x,
                        cy = parentNode.y,
                        rdm = curNode.value / 1000,
                        nodeX = cx + Math.cos(curPi) * cRadius,
                        nodeY = cy + Math.sin(curPi) * cRadius;
                    curNode.x = nodeX;
                    curNode.y = nodeY;
                    delete curNode.NextNodes;
                    //delete curNode.hasChild;
                    //delete curNode.radius;
                    cNodeLen--;
                }
                //end
            }
        },
        /**
         * 移动节点
         * @param  {[type]} node  [description]
         * @param  {[type]} nodes [description]
         * @param  {[type]} links [description]
         * @param  {[type]} newX  [description]
         * @param  {[type]} newY  [description]
         * @return {[type]}       [description]
         */
        dshiftNode: function(node, nodes, links, newX, newY) {
            var id = node.id;
            var oldPos = [node.x, node.y];
            var newPos = [newX, newY];
            var dshift = [newPos[0] - oldPos[0], newPos[1] - oldPos[1]];
            node.x = newX;
            node.y = newY;
            console.log('node.x:' + node.x + ',node.y:' + node.y)
                //console.log('node.x:'+node.x+',node.y:'+node.y)
            var childNodes = getChildNodes(node.id);
            if (childNodes && childNodes.length > 0) {
                console.log('childNodes.length' + childNodes.length);
                childNodes.forEach(function(childNode, index) {
                    dshiftNodeOffset(childNode, dshift[0], dshift[1]);
                });
            }

            function getChildNodes(id) {
                var childNodeIds = _.filter(links, function(link, index) {
                    return link.source == id;
                }).map(function(link, index) {
                    return link.target;
                });
                if (childNodeIds.length <= 0) return [];
                var childNodes = _.filter(nodes, function(node, index) {
                    return childNodeIds.indexOf(node.id) > -1;
                })
                return childNodes;
            }

            function dshiftNodeOffset(node, offsetX, offSetY) {
                var oldX = node.x,
                    oldY = node.y;
                node.x = oldX + offsetX;
                node.y = oldY + offSetY;
                var childNodes = getChildNodes(node.id);
                if (childNodes && childNodes.length > 0) {
                    childNodes.forEach(function(childNode, index) {
                        dshiftNodeOffset(childNode, offsetX, offSetY)
                    })
                }
            }

        },
        /**
         * 显示节点关系
         * @param  {[type]} curNode [description]
         * @param  {[type]} nodes   [description]
         * @param  {[type]} links   [description]
         * @return {[type]}         [description]
         */
        showNodeRelation: function(curNode, nodes, links) {
            if (this.calculating) return;
            curNode.showRelation = true;
            var person = curNode.person;
            if (!person) return;
            var relativeNodes = _.filter(nodes, function(node, index) {
                if (node.person) {
                    return node.person.id == person.id && curNode.id != node.id;
                }
                return false;
            });
            var lineDatas = [];
            if (relativeNodes && relativeNodes.length > 0) {
                var linkLen = links.length;

                relativeNodes.forEach(function(relativeNode, index) {
                    relativeNode.showRelation = true;
                    var link = {
                        id: 'relation-link-' + index,
                        relation: person.id,
                        category: curNode.category,
                        source: curNode.id,
                        target: relativeNode.id,
                        lineStyle: {
                            normal: {
                                color: '#333',
                                width: 5,
                                type: 'dashed',
                                curveness: 0
                            }
                        }
                    }
                    links.push(link);
                });
            }
            this.calculating = false;
        },
        /**
         * 隐藏节点关系
         * @param  {[type]} curNode [description]
         * @param  {[type]} nodes   [description]
         * @param  {[type]} links   [description]
         * @return {[type]}         [description]
         */
        hideNodeRelation: function(curNode, nodes, links) {
            if (this.calculating) return;
            curNode.showRelation = false;
            var person = curNode.person;
            if (!person) return;
            var linkLen = links.length,
                i = linkLen - 1;
            for (; i > 0; i--) {
                if (links[i].relation && links[i].relation == person.id) {
                    links.splice(i, 1);
                }
            }
            _.filter(nodes, function(node, index) {
                if (node.person) {
                    return node.person.id == person.id && curNode.id != node.id;
                }
                return false;
            }).forEach(function(relativeNode, index) {
                relativeNode.showRelation = false;
            });
            this.calculating = false;
        }
    }
    return nodeHelper;
})