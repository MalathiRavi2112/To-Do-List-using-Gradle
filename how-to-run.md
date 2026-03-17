# How to Run the To-Do List Application

## Prerequisites
Make sure you have Java installed. (You do not need Gradle to run the pre-compiled application).

## Step-by-Step Instructions

1. Open your terminal or command prompt (PowerShell).
2. Navigate to the project directory by running:
   ```shell
   cd c:\Users\aakas\OneDrive\Desktop\todo-list-master
   ```
   
3. Run the application using the pre-compiled JAR file by running:
   ```shell
   java -jar todo-list-1.0-SNAPSHOT.jar
   ```
   
4. The application menu will appear in your console. It will look like this:

   ```text
   MAIN MENU
   ===========
   
   You have X task(s) todo  and Y completed task(s)
   
   Pick an option:
   (1) Show Task List (by date or project)
   (2) Add New Task
   (3) Edit Task (update, mark as done, remove)
   (4) Save and Quit
   ```

5. Type `1`, `2`, `3`, or `4` and press **ENTER** to select an option.

6. **Important:** When you are done using the application, always select **Option 4 (Save and Quit)** to close it safely. This ensures your tasks are saved to the `tasks.obj` file so the application remembers them for next time.

---

### Additional Notes for Developers:
The command `gradle build` (and running the resulting JAR from `build/libs`) is only necessary if you open the Java source code (`.java` files in the `src` folder) and make changes to them. If you plan to do this, we recommend opening the project folder in **IntelliJ IDEA**, which will manage Gradle and the build process for you automatically.
