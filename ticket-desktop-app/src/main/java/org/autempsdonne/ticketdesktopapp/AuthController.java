package org.autempsdonne.ticketdesktopapp;

import org.autempsdonne.ticketdesktopapp.models.User;
import org.autempsdonne.ticketdesktopapp.services.ApiService;
import org.json.JSONObject;

import java.io.FileWriter;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.io.File;
import java.net.http.HttpResponse;
import java.util.Base64;
import java.util.Scanner;

import javafx.scene.image.Image;

public class AuthController {
    private static final int USERNAME_MAX_LENGTH = 45;
    private static final int PASSWORD_MAX_LENGTH = 50;
    private static String jwt = "";
    private static User user = null;
    public static final String USER_PFP_PATH = AtdTicketApplication.BUCKET_URL+"/users-pfp/user-id-pfp.png";
    public static final String DEFAULT_PFP_PATH = AtdTicketApplication.BUCKET_URL+"/users-pfp/default-pfp.png";

    // Getters
    static public String getJwt() { return jwt; }

    static public User getUser() { return user; }

    // Setters
    public void setJwt(String newJwt) { jwt = newJwt; }

    static public void setUser(User newUser) { user = newUser; }

    // Methods

    public static boolean isLoggedIn() {
        try {
            String jwt = parseJwtFromCookie(getCookieFile());
            boolean check = checkJwt(jwt);
            check = isJwtValid(jwt);
            return check;
        } catch (Exception e) {
            if (AtdTicketApplication.DEBUG_STATUS) System.out.println("Error at parseJwtFromCookie : " + e.getMessage());
            return false;
        }
    }

    private static File getCookieFile() {
        try {
            File cookieFile = new File("./cookie.bin");
            return (cookieFile.exists()) ? cookieFile : null;
        } catch (Exception e) {
            if (AtdTicketApplication.DEBUG_STATUS) System.out.println("Error at parseJwtFromCookie : " + e.getMessage());
            return null;
        }
    }

    public static String parseJwtFromCookie(File cookieFile) {
        try {
            if (cookieFile == null) cookieFile = getCookieFile();
            if (cookieFile != null ) {
                String data = "";
                Scanner fileReader = new Scanner(cookieFile);
                if (fileReader.hasNextLine()) data = fileReader.nextLine();
                fileReader.close();
                return data;
            } else {
                return null;
            }
        } catch (Exception e) {
            if (AtdTicketApplication.DEBUG_STATUS) System.out.println("Error at parseJwtFromCookie : " + e.getMessage());
            return null;
        }
    }

    private static boolean isJwtValid(String jwt) {
        try {
            HttpResponse response = ApiService.getRequest("/api/me");
            if (response != null) {
                JSONObject userObj = new JSONObject(response.body().toString());
                return userObj.has("username");
            }
            return false;
        } catch (Exception e) {
            if (AtdTicketApplication.DEBUG_STATUS) System.out.println("Error at isJwtValid : " + e.getMessage());
            return false;
        }
    }

    private static boolean checkJwt(String jsonWebToken) {
        if (jsonWebToken == null) return false;

        String[] chunks = jsonWebToken.split("\\.");
        if (chunks.length > 0) {
            Base64.Decoder decoder = Base64.getUrlDecoder();
            String header = new String(decoder.decode(chunks[0]));
            String payload = new String(decoder.decode(chunks[1]));
            JSONObject payloadObj  = new JSONObject(payload);
            jwt = jsonWebToken;
            user = new User(
                payloadObj.getInt("userId"), payloadObj.getInt("rank"),
                payloadObj.getString("username"), payloadObj.getString("name"),
                payloadObj.getString("lastname"), payloadObj.getString("lang"),
                payloadObj.getString("pfp")
            );
            return true;
        }
        return false;
    }

    public static boolean checkAuthCredsSize(String username, String password) {
        if (username.isEmpty() || username.length() > USERNAME_MAX_LENGTH) return false;
        if (password.isEmpty() || password.length() > PASSWORD_MAX_LENGTH) return false;
        return true;
    }

    public static boolean login(String username, String password) {
        try {
            if (checkAuthCredsSize(username, password)) {
                String requestStr = AtdTicketApplication.API_BASE_URL + "/login";
                String body = "username=" + username + "&password=" + password;
                HttpClient client = HttpClient.newHttpClient();
                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(requestStr))
                        .header("Content-Type", "application/x-www-form-urlencoded")
                        .POST(HttpRequest.BodyPublishers.ofString(body))
                        .build();
                HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
                if (response.statusCode() == 200) {
                    String responseBody = response.body();
                    JSONObject json = new JSONObject(responseBody);
                    String jwt = json.getString("jwt");
                    if (!jwt.isEmpty()) {
                        boolean checkGen = generateCookieFile(jwt);
                        return checkGen;
                    }
                }
            }
            return false;
        } catch (Exception e) {
            if (AtdTicketApplication.DEBUG_STATUS) System.out.println("Error at @LoginViewController->login : " + e.getMessage());
            return false;
        }
    }

    public static boolean generateCookieFile(String jwt) {
        try {
            File cookieFile = new File("./cookie.bin");
            if (cookieFile.exists()) cookieFile.delete();
            if (cookieFile.createNewFile()) {
                FileWriter writer = new FileWriter(cookieFile);
                writer.write(jwt);
                writer.close();
                return true;
            }
            return false;
        } catch (Exception e) {
            if (AtdTicketApplication.DEBUG_STATUS) System.out.println("Error at generateCookieFile : " + e.getMessage());
            return false;
        }
    }

    public static boolean logout() {
        try {
            File cookieFile = new File("./cookie.bin");
            if (cookieFile.exists()) return cookieFile.delete();
            return false;
        } catch (Exception e) {
            if (AtdTicketApplication.DEBUG_STATUS) System.out.println("Error at logout : " + e.getMessage());
            return false;
        }
    }

    public static String getUserPfpPath(int userId) {
        try {
            String path = USER_PFP_PATH.replace("id", String.valueOf(userId));
            Image check = new Image(path);
            return (check.isError()) ? DEFAULT_PFP_PATH : path;
        } catch (Exception e) {
            return DEFAULT_PFP_PATH;
        }
    }
}
