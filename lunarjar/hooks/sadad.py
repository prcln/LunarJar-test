import pandas as pd
import re

# Read the Excel file
file_path = 'your_file.xlsx'  # Replace with your actual file path
df = pd.read_excel(file_path)

# Function to extract student ID
def extract_student_id(text):
    """
    Extract student ID (9-digit number starting with 202) from text
    """
    if pd.isna(text):
        return None
    
    # Convert to string
    text = str(text)
    
    # Pattern: 9-digit number starting with 202
    pattern = r'\b(202\d{6})\b'
    
    match = re.search(pattern, text)
    if match:
        return match.group(1)
    return None

# Apply the function to the column (replace 'column_name' with your actual column name)
column_name = 'Data'  # Replace with your column name
df['Student_ID'] = df[column_name].apply(extract_student_id)

# Save to a new Excel file
output_path = 'output_with_student_ids.xlsx'
df.to_excel(output_path, index=False)

print(f"Processing complete! File saved as: {output_path}")
print(f"\nFirst few rows:")
print(df[[column_name, 'Student_ID']].head())