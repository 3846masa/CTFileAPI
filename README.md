# CTFileAPI
File-based CTF-Question Serving API.

## How to use
- Clone project.
- Create ``static`` folder in project root.
- Put questions folloing below.
  - ``questionList.json`` is JSON Array of folders.
    - If not exist, create dynamically
  - Folder is ``{Category}-{Points}-{QuestionName}``
  - ``README.md`` is description of question.
  - ``flag.sha3-512`` is SHA3-512 Hash.
  - Path in .md should be relateive path.
  - ``README.md`` and ``flag.sha3-512`` are required.

```
static/
  |--- questionList.json
  |--- Binary-100-Overflow
  |   |- README.md
  |   |- flag.sha3-512
  |   |- q.exe
  |
  |--- Misc-050-HelloWorld
  |   |- README.md
  |   |- flag.sha3-512
  |   |- file.dat
  |
  |--- Web-500-JavaScript
      |- README.md
      |- flag.sha3-512
```

- Then, ``npm start``.

## API (json)
- GET ``/``
  - Server status.
- GET ``/scores``
  - All Users and Scores
- GET ``/login``
  - Redirect to Twitter Login
- GET ``/logout``
  - Logout
- GET ``/user``
  - User Info if you passed auth
- POST ``/submit``
  - You submit flag
  - ``Content-Type: application/json`` is required
  - Example
    ```json
    {
      "question": "Misc-100-Hello",
      "flag":"FLAG{Hello,World}"
    }
    ```
- GET ``/{staticFilePath}``
  - Example: ``/Misc-100-Hello/README.md``
