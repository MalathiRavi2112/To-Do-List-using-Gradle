package org.sda.todolist;

import static spark.Spark.*;
import com.google.gson.*;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

public class WebMain {
    public static void main(String[] args) {
        // Run on designated port (4567 by default in Spark)
        port(4567);
        
        // Serve static files from src/main/resources/public
        staticFiles.location("/public");

        TodoList todoList = new TodoList();
        // Load existing tasks
        todoList.readFromFile(Main.filename);

        // Custom Gson configuration to handle LocalDate serialization properly
        Gson gson = new GsonBuilder()
            .registerTypeAdapter(LocalDate.class, (JsonSerializer<LocalDate>) (src, type, ctx) -> new JsonPrimitive(src.format(DateTimeFormatter.ISO_LOCAL_DATE)))
            .registerTypeAdapter(LocalDate.class, (JsonDeserializer<LocalDate>) (json, type, ctx) -> LocalDate.parse(json.getAsString(), DateTimeFormatter.ISO_LOCAL_DATE))
            .create();

        // Error handling
        exception(Exception.class, (e, req, res) -> {
            res.status(500);
            res.body(gson.toJson(e.getMessage()));
            e.printStackTrace();
        });

        // --- HTTP REST API ENDPOINTS ---

        // Fetch all Tasks
        get("/api/tasks", (req, res) -> {
            res.type("application/json");
            return todoList.getTaskList();
        }, gson::toJson);

        // Add a new Task
        post("/api/tasks", (req, res) -> {
            res.type("application/json");
            Task newTask = gson.fromJson(req.body(), Task.class);
            
            todoList.addTask(newTask.getTitle(), newTask.getProject(), newTask.getDueDate());
            todoList.saveToFile(Main.filename);
            
            return todoList.getTaskList();
        }, gson::toJson);

        // Toggle Task Completion
        put("/api/tasks/:id/toggle", (req, res) -> {
            res.type("application/json");
            int id = Integer.parseInt(req.params(":id"));
            
            Task task = todoList.getTaskList().get(id);
            if (task.isComplete()) {
                task.markInComplete();
            } else {
                task.markCompleted();
            }
            todoList.saveToFile(Main.filename);
            
            return todoList.getTaskList();
        }, gson::toJson);

        // Delete a Task
        delete("/api/tasks/:id", (req, res) -> {
            res.type("application/json");
            int id = Integer.parseInt(req.params(":id"));
            
            todoList.getTaskList().remove(id);
            todoList.saveToFile(Main.filename);
            
            return todoList.getTaskList();
        }, gson::toJson);

        System.out.println("Web server started successfully! Go to http://localhost:4567");
    }
}
