-"""
SkillPath AI — ML Model Trainer
Trains a career recommendation model using cosine similarity + KNN classifier.
Run: python train.py
Output: models/career_model.pkl, models/encoder.pkl
"""
import os, json, pickle
import numpy as np
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.model_selection import cross_val_score
from sklearn.metrics import classification_report

# ─── Training dataset ─────────────────────────────────────────────────────────
# Format: (user_skills_list, target_career)
TRAINING_DATA = [
    # Data Scientist
    (["python","statistics","machine_learning","pandas","sql","visualization","numpy"], "Data Scientist"),
    (["python","ml","statistics","data_analysis","sklearn","matplotlib"],              "Data Scientist"),
    (["r","statistics","machine_learning","data_visualization","sql"],                 "Data Scientist"),
    (["python","deep_learning","nlp","pandas","statistics","sql"],                     "Data Scientist"),
    (["python","tensorflow","statistics","pandas","feature_engineering"],              "Data Scientist"),

    # ML Engineer
    (["python","tensorflow","pytorch","mlops","docker","kubernetes","deep_learning"],  "ML Engineer"),
    (["python","machine_learning","model_deployment","fastapi","docker","aws"],        "ML Engineer"),
    (["python","pytorch","deep_learning","cuda","optimization","c++"],                 "ML Engineer"),
    (["python","mlflow","kubernetes","docker","rest_api","machine_learning"],          "ML Engineer"),
    (["python","tensorflow","serving","grpc","docker","deep_learning"],                "ML Engineer"),

    # Data Engineer
    (["python","sql","spark","airflow","aws","etl","kafka","hdfs"],                    "Data Engineer"),
    (["python","sql","dbt","snowflake","airflow","etl","data_modeling"],               "Data Engineer"),
    (["scala","spark","hadoop","kafka","hive","python","sql"],                         "Data Engineer"),
    (["python","aws","glue","redshift","s3","sql","etl"],                              "Data Engineer"),
    (["python","databricks","delta_lake","spark","sql","airflow"],                     "Data Engineer"),

    # Backend Developer
    (["python","fastapi","postgresql","redis","docker","rest_api","sql"],              "Backend Developer"),
    (["nodejs","express","mongodb","postgresql","rest_api","docker","sql"],            "Backend Developer"),
    (["java","spring_boot","microservices","postgresql","kafka","docker"],             "Backend Developer"),
    (["golang","grpc","postgresql","redis","docker","kubernetes"],                     "Backend Developer"),
    (["python","django","rest_api","postgresql","redis","celery"],                     "Backend Developer"),

    # Full Stack Developer
    (["javascript","react","nodejs","sql","html","css","rest_api","git"],              "Full Stack Developer"),
    (["typescript","react","nextjs","nodejs","postgresql","tailwind"],                 "Full Stack Developer"),
    (["javascript","vue","nodejs","mongodb","express","html","css"],                   "Full Stack Developer"),
    (["react","graphql","nodejs","postgresql","typescript","docker"],                  "Full Stack Developer"),
    (["angular","nodejs","typescript","postgresql","rest_api","css"],                  "Full Stack Developer"),

    # Cloud Architect
    (["aws","azure","gcp","kubernetes","docker","terraform","networking","iam"],       "Cloud Architect"),
    (["aws","terraform","ansible","kubernetes","python","networking"],                 "Cloud Architect"),
    (["gcp","kubernetes","istio","terraform","python","networking","security"],        "Cloud Architect"),
    (["azure","aks","terraform","networking","python","devops","security"],            "Cloud Architect"),
    (["aws","eks","cloudformation","networking","python","security","iam"],            "Cloud Architect"),

    # DevOps Engineer
    (["docker","kubernetes","ci_cd","linux","aws","terraform","monitoring","git"],     "DevOps Engineer"),
    (["jenkins","docker","kubernetes","ansible","python","linux","git"],               "DevOps Engineer"),
    (["github_actions","docker","kubernetes","terraform","aws","python"],              "DevOps Engineer"),
    (["gitlab_ci","docker","kubernetes","prometheus","grafana","linux"],               "DevOps Engineer"),
    (["argocd","kubernetes","helm","terraform","python","monitoring"],                 "DevOps Engineer"),

    # Cybersecurity Analyst
    (["networking","linux","python","penetration_testing","siem","cryptography","nmap"], "Cybersecurity Analyst"),
    (["ethical_hacking","linux","python","burpsuite","networking","sql_injection"],    "Cybersecurity Analyst"),
    (["splunk","networking","python","forensics","incident_response","linux"],         "Cybersecurity Analyst"),
    (["networking","firewalls","python","security_auditing","linux","compliance"],     "Cybersecurity Analyst"),
    (["malware_analysis","linux","python","reverse_engineering","networking"],         "Cybersecurity Analyst"),

    # Data Analyst
    (["sql","excel","python","tableau","statistics","visualization","reporting"],      "Data Analyst"),
    (["sql","power_bi","excel","statistics","python","data_cleaning"],                 "Data Analyst"),
    (["sql","looker","python","statistics","dashboards","data_modeling"],              "Data Analyst"),
    (["sql","excel","r","statistics","visualization","business_intelligence"],         "Data Analyst"),
    (["sql","tableau","python","statistics","excel","kpi_tracking"],                   "Data Analyst"),

    # AI Research Engineer
    (["python","deep_learning","pytorch","mathematics","research","nlp","transformers"], "AI Research Engineer"),
    (["python","pytorch","reinforcement_learning","mathematics","cuda","research"],    "AI Research Engineer"),
    (["python","tensorflow","computer_vision","mathematics","research","opencv"],      "AI Research Engineer"),
    (["python","jax","mathematics","nlp","transformers","llm","research"],             "AI Research Engineer"),
    (["python","pytorch","gans","mathematics","deep_learning","research"],             "AI Research Engineer"),

    # Product Manager
    (["communication","analytics","sql","agile","roadmapping","stakeholders","jira"], "Product Manager"),
    (["product_strategy","analytics","user_research","agile","communication","sql"],  "Product Manager"),
    (["figma","analytics","agile","stakeholders","communication","sql","roadmapping"],"Product Manager"),
    (["user_research","analytics","agile","communication","sql","prioritization"],    "Product Manager"),
    (["okrs","analytics","agile","communication","stakeholders","product_strategy"],  "Product Manager"),
]

ALL_SKILLS = sorted(set(s for skills, _ in TRAINING_DATA for s in skills))

def encode(skill_list):
    vec = np.zeros(len(ALL_SKILLS))
    for s in skill_list:
        if s in ALL_SKILLS:
            vec[ALL_SKILLS.index(s)] = 1
    return vec

def train():
    print("Training SkillPath AI career recommender model...")
    X = np.array([encode(skills) for skills, _ in TRAINING_DATA])
    y = [career for _, career in TRAINING_DATA]

    model = KNeighborsClassifier(n_neighbors=5, metric='cosine', weights='distance')
    model.fit(X, y)

    # Cross-validation
    scores = cross_val_score(model, X, y, cv=5, scoring='accuracy')
    print(f"Cross-validation accuracy: {scores.mean():.2%} ± {scores.std():.2%}")

    # Save model and skill list
    os.makedirs("models", exist_ok=True)
    with open("models/career_model.pkl", "wb") as f:
        pickle.dump(model, f)
    with open("models/skills_list.json", "w") as f:
        json.dump(ALL_SKILLS, f)
    with open("models/careers_list.json", "w") as f:
        json.dump(sorted(set(c for _,c in TRAINING_DATA)), f)

    print(f"Model saved → models/career_model.pkl")
    print(f"Skills ({len(ALL_SKILLS)}) → models/skills_list.json")
    print(f"Careers → models/careers_list.json")
    return model

def predict(user_skills: list[str], top_n=5):
    """Load saved model and predict top N careers"""
    try:
        with open("models/career_model.pkl", "rb") as f:
            model = pickle.load(f)
        with open("models/skills_list.json") as f:
            skills = json.load(f)
    except FileNotFoundError:
        print("Model not found. Run train.py first.")
        return []

    global ALL_SKILLS
    ALL_SKILLS = skills
    vec = encode(user_skills).reshape(1, -1)
    proba = model.predict_proba(vec)[0]
    classes = model.classes_
    top = sorted(zip(classes, proba), key=lambda x: -x[1])[:top_n]
    return [{"career": c, "confidence": round(p*100,1)} for c,p in top]

if __name__ == "__main__":
    model = train()

    # Test prediction
    test_skills = ["python", "sql", "machine_learning", "pandas", "statistics"]
    print(f"\nTest prediction for skills: {test_skills}")
    # Quick inline predict (model just trained, in memory)
    X_test = encode(test_skills).reshape(1,-1)
    proba = model.predict_proba(X_test)[0]
    results = sorted(zip(model.classes_, proba), key=lambda x:-x[1])[:5]
    print("\nTop career matches:")
    for career, conf in results:
        print(f"  {career:30s} {conf*100:.1f}%")
