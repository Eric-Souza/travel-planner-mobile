Test notes — sample uploads for the document pipeline
=====================================================

Quick upload (recommended)
--------------------------
Use travel-test-documents.pdf — all three confirmations in one file.
Upload from trip -> Documents (Demo mode OFF).

Regenerate the PDF after editing any .txt file:
  python test-notes/generate_pdf.py

Individual .txt files
---------------------
- hotel-bariloche-confirmation.txt  — Hotel in Bariloche (Aug 5-8, 2026)
- flight-eze-brc-confirmation.txt     — Flights EZE <-> BRC
- restaurant-reservation.txt        — Restaurant in Buenos Aires

How to use
----------
1. Turn Demo mode OFF on the trips list.
2. Open a trip -> Documents -> upload travel-test-documents.pdf (or a single .txt).
3. Process -> Extract booking -> Review -> Confirm.
4. Check Timeline and Chat (e.g. "What time is my check-in?").

Mock LLM note
-------------
With USE_MOCK_LLM=true on the API (default), extraction returns a fixed mock
hotel regardless of file content. Upload/process/review/confirm still exercises
the full UI; source excerpts come from your file. For content-driven extraction,
set USE_MOCK_LLM=false and run Ollama on the backend.
