Task: Wire Real Auth \+ CSRF to the Existing Frontend  
Deadline: 11:59 PM 12 May 2026

This builds on the zip project I provided. The mock auth and CSRF simulation already in the code need to be replaced with real flows backed by a server.

Backend (bare minimum, not the focus, no DB needed) 

* Set up a minimal backend  
* Use hardcoded data in code, just enough so login validates against something real, not a mock flag.  
* Keep it simple. No need for user registration, roles, or anything beyond what is listed.

What you actually need to implement

* Replace mock login with a real call to POST /login. Store it.  
* After login succeeds, the user should be sent back to where they tried to go.  
* Fetch a real CSRF token from the backend and include it in any state-changing request header.  
* On the backend, reject state-changing requests that are missing or have an invalid CSRF token.  
* Keep each commit small and focused. Demo video must show login redirect-back, protected page access, and CSRF pass and fail.

Commit expectations:

* Commit 1: full baseline I shared, including package-lock.json.  
* Your work starts from Commit 2 onward.

