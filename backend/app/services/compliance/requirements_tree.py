from typing import Dict, List
from sqlalchemy.orm import Session
from app.models.compliance.framework_requirement import FrameworkRequirement
from app.schemas.compliance.requirements_tree import RequirementTreeNode

def get_requirements_tree(db: Session, version_id: int) -> List[RequirementTreeNode]:
    rows = (
        db.query(
            FrameworkRequirement.id,
            FrameworkRequirement.code,
            FrameworkRequirement.title,
            FrameworkRequirement.parent_id,
            FrameworkRequirement.sort_index,
        )
        .filter(FrameworkRequirement.framework_version_id == version_id)
        .order_by(FrameworkRequirement.parent_id.nullsfirst(), FrameworkRequirement.sort_index.asc(), FrameworkRequirement.id.asc())
        .all()
    )
    nodes: Dict[int, RequirementTreeNode] = {}
    roots: List[RequirementTreeNode] = []
    for r in rows:
        node = RequirementTreeNode(
            id=r.id, code=r.code, title=r.title, parent_id=r.parent_id, sort_index=r.sort_index, children=[]
        )
        nodes[r.id] = node
    for node in nodes.values():
        if node.parent_id and node.parent_id in nodes:
            nodes[node.parent_id].children.append(node)
        else:
            roots.append(node)
    # sort children by sort_index
    def _sort_subtree(n: RequirementTreeNode):
        n.children.sort(key=lambda x: (x.sort_index, x.id))
        for c in n.children:
            _sort_subtree(c)
    for root in roots:
        _sort_subtree(root)
    return roots
