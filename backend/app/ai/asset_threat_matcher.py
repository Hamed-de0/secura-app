# from sentence_transformers import SentenceTransformer
# from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict
# import numpy as np

# Load model once globally for performance
# model = SentenceTransformer('sentence-transformers/all-mpnet-base-v2')  # ~80MB, fast and solid

def suggest_threats_for_assets(
    asset_types: List[Dict],  # [{'id': 1, 'name': 'Firewall', 'description': '...'}, ...]
    threats: List[Dict],      # [{'id': 10, 'name': 'Unauthorized Access', 'description': '...'}, ...]
    top_k: int = 5
) -> Dict[int, List[Dict]]:
    """
    Return top-k matching threats per asset_type based on semantic similarity
    """
    return {}
    # # 1. Prepare texts for embedding
    # asset_texts = [f"{a['name']} - {a.get('description', '')}" for a in asset_types]
    # threat_texts = [f"{t['name']} - {t.get('description', '')}" for t in threats]
    #
    # # 2. Generate embeddings
    # asset_embeddings = model.encode(asset_texts, convert_to_tensor=True)
    # threat_embeddings = model.encode(threat_texts, convert_to_tensor=True)
    #
    # # 3. Compute cosine similarity
    # similarity_matrix = cosine_similarity(asset_embeddings.cpu().numpy(), threat_embeddings.cpu().numpy())
    #
    # # 4. Get top-k matches for each asset type
    # suggestions = {}
    # for i, asset in enumerate(asset_types):
    #     sims = similarity_matrix[i]
    #     top_indices = np.argsort(sims)[::-1][:top_k]
    #
    #     suggestions[asset["id"]] = [
    #         {
    #             "threat_id": threats[idx]["id"],
    #             "name": threats[idx]["name"],
    #             "score": round(float(sims[idx]), 3)
    #         }
    #         for idx in top_indices
    #     ]
    #
    # return suggestions
