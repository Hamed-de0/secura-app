# app/services/ai_matcher.py

# from sentence_transformers import SentenceTransformer
# from sklearn.metrics.pairwise import cosine_similarity
# import numpy as np
from typing import List, Dict

# model = SentenceTransformer('BAAI/bge-m3')  # Replaceable later

def suggest_threats_for_asset_type(asset_type: Dict, threats: List[Dict], top_k: int = 5) -> List[Dict]:
    return []
    # threshold = 0.1
    #
    # # Prepare text
    # asset_text = f"{asset_type['category']} - {asset_type['name']} - {asset_type.get('description', '')}".lower()
    # threat_texts = [f"{t['category']} - {t['name']} - {t.get('description', '')}".lower() for t in threats]
    #
    # # Generate embeddings
    # asset_embedding = model.encode([asset_text])
    # threat_embeddings = model.encode(threat_texts)
    #
    # # Calculate similarity (result is a 1D array)
    # sims = cosine_similarity(asset_embedding, threat_embeddings)[0]  # shape: (len(threats),)
    #
    # # Get top-k indices
    # top_indices = sims.argsort()[::-1][:top_k]
    #
    # # Prepare result list
    # matches = []
    # for idx in top_indices:
    #     score = sims[idx]
    #     if score >= threshold:
    #         matches.append({
    #             "asset_type_id": asset_type["id"],
    #             "threat_id": threats[idx]["id"],
    #             "name": threats[idx]["name"],
    #             "score": round(float(score), 3)
    #         })
    #
    # return matches

