💳 Customer Churn Prediction for Online Payments
📘 Overview

Customer churn refers to when customers stop using a company’s product or service. In the highly competitive online payments industry, predicting customer churn is crucial for improving retention and reducing revenue loss.

This project applies Machine Learning to predict whether a customer is likely to churn based on their transaction patterns, activity frequency, error rates, and engagement metrics. The insights can help payment platforms implement targeted retention strategies.

🧠 Project Objectives

Predict whether a customer will churn or stay active.

Identify key behavioral and transactional factors leading to churn.

Provide actionable insights for business teams to reduce churn.

Develop an end-to-end ML pipeline for prediction and deployment.

📊 Dataset
1️⃣ Dataset Description

The dataset contains anonymized data from an online payment platform, representing customer activity and engagement over 90 days.

Feature	Description
Transaction_Volume_90d	Total amount transacted in the last 90 days
Volume_Change_%	Change in transaction volume compared to previous 90 days
Success_Rate_%	Percentage of successful transactions
API_Error_Rate_%	Percentage of failed API calls
Refund_Amount_90d	Total refunded amount in the last 90 days
Chargeback_Rate_%	Percentage of chargeback transactions
Number_of_Users	Number of active users in the customer’s account
Login_Frequency_per_week	Average logins per week
Feature_Adoption_%	Percentage of platform features used
Last_Transaction_days	Days since the last transaction
Support_Tickets	Number of support requests raised
Churn	Target label: 1 = churned, 0 = active
⚙️ Tech Stack
Category	Tools / Libraries
Programming Language	Python 🐍
Data Analysis	pandas, NumPy
Data Visualization	matplotlib, seaborn
Machine Learning	scikit-learn, TensorFlow / Keras
Model Optimization	RandomizedSearchCV, EarlyStopping
Deployment (Optional)	FastAPI / Streamlit
Version Control	Git, GitHub
🧩 Project Workflow
1️⃣ Data Preprocessing

Handling missing values

Feature scaling and normalization

Encoding categorical variables (if any)

Outlier detection

2️⃣ Exploratory Data Analysis (EDA)

Visualizing churn vs. key metrics

Correlation analysis

Identifying top churn indicators

3️⃣ Model Development

Multiple models were tested:

Logistic Regression

Random Forest Classifier 🌲

XGBoost

Deep Learning (Keras Sequential Model)

The best performing model was Random Forest, achieving ~92% accuracy with balanced precision and recall.

4️⃣ Model Evaluation

Metrics used:

Accuracy

Precision, Recall, F1-Score

ROC-AUC Curve

5️⃣ Deployment (Optional)

A simple FastAPI or Streamlit app was developed for interactive churn prediction:

User inputs customer metrics

Model predicts churn probability

Dashboard displays churn risk levels:

🟢 Low Risk (0–40%)

🟡 Medium Risk (40–70%)

🔴 High Risk (70–100%)

📈 Results
Metric	Random Forest	Neural Network
Accuracy	92%	89%
Precision	90%	87%
Recall	91%	88%
F1 Score	90.5%	87.5%

Key Factors Influencing Churn:

📉 Decrease in transaction volume

🧾 High refund/chargeback rates

⚙️ Low feature adoption

⏱️ Longer inactivity periods

🚨 High API error rate

🧰 Installation & Setup
Prerequisites

Python 3.8+

pip

Steps
# 1. Clone the repository
git clone https://github.com/your-username/customer-churn-prediction.git
cd customer-churn-prediction

# 2. Create and activate virtual environment
python -m venv venv
venv\Scripts\activate   # for Windows
source venv/bin/activate  # for Mac/Linux

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run the model training script
python train_model.py

# 5. (Optional) Run the web app
streamlit run app.py

📂 Folder Structure
Customer-Churn-Prediction/
│
├── data/
│   ├── raw_data.csv
│   └── processed_data.csv
│
├── notebooks/
│   ├── EDA.ipynb
│   └── Model_Training.ipynb
│
├── src/
│   ├── data_preprocessing.py
│   ├── model_training.py
│   ├── utils.py
│   └── prediction_service.py
│
├── app/
│   ├── main.py              # FastAPI/Streamlit app
│   └── templates/
│       └── dashboard.html
│
├── saved_models/
│   └── churn_model.pkl
│
├── requirements.txt
├── README.md
└── report/
    └── Project_Report.pdf

🚀 Future Enhancements

Incorporate real-time churn monitoring dashboard

Add customer segmentation (KMeans) for retention campaigns

Integrate SHAP explainability for feature impact visualization

Deploy as REST API on AWS / Azure

👨‍💻 Authors
Name	Role
Eenapati Srujan	Data Preprocessing, EDA, Report Writing
Kallakuri Charan	Model Building, Evaluation, Optimization
Vankayala Manish	Frontend, Deployment, Documentation
🏁 Conclusion

This project demonstrates the power of machine learning in identifying potential churners among payment platform customers.
By proactively analyzing customer behavior, businesses can enhance retention, improve satisfaction, and increase lifetime value.
