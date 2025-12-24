As the Operations Coordinator for a store generating $1M+ in annual revenue, I was in charge of processing invoices weekly and a $30k food insecurity budget. The manual entry process was time-consuming and prone to human error, taking over 5 hours every week just to draft reports.

I built this dashboard to automate that problem. By integrating AI-driven document parsing, I increased invoice processing efficiency by ~50%, allowing the team to focus on store strategy rather than data entry. The web-app also allows to track expenses per vendor, store revenue, generating reports over customizable dates and a searchable invoice archive using PostgreSQL.


**Key Features:**

**Automated Data Extraction:** Uses Apache PDFBox and OpenAI's LLM pipeline to parse complex supplier invoices automatically.

**Real-time Analytics:** A React frontend provides instant visibility into supplier expenses and payment terms.

**Budget Tracking**: A PostgreSQL backend archives financial data and automates tracking for the $30k FED-UP Budget.

**Secure Access:** Implemented REST APIs with structured data handling to ensure financial integrity.


**Tech Stack:**

**Backend:** Java (Spring Boot), Maven 

**Frontend:** React.js, Material UI, JavaScript 

**Database:** PostgreSQL 

**AI/ML:** OpenAI API, Apache PDFBox 

**Tools:** Git, VScode
