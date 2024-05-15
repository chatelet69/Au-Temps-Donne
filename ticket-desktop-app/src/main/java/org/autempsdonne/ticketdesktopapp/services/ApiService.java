package org.autempsdonne.ticketdesktopapp.services;

import okhttp3.*;
import org.autempsdonne.ticketdesktopapp.AtdTicketApplication;
import org.autempsdonne.ticketdesktopapp.AuthController;

import java.io.File;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;

public class ApiService {
    public static final String FORM_URL_ENCODED = "application/x-www-form-urlencoded";

    public static boolean checkApiStatus() {
        try {
            HttpResponse<String> response = getRequest("/");
            return (response != null && response.statusCode() == 200);
        } catch (Exception e) {
            if (AtdTicketApplication.DEBUG_STATUS) System.out.println("Error at @checkApiStatus : " + e.getMessage());
            return false;
        }
    }

    public static HttpResponse<String> getRequest(String endpoint) {
        try {
            if (!endpoint.isEmpty()) {
                String requestStr = AtdTicketApplication.API_BASE_URL + endpoint;
                HttpResponse<String> response;
                try {
                    HttpClient client = HttpClient.newHttpClient();
                    HttpRequest request = HttpRequest.newBuilder()
                            .uri(URI.create(requestStr))
                            .header("Cookie", "atdCookie=" + AuthController.getJwt())
                            .GET().build();
                    response = client.send(request, HttpResponse.BodyHandlers.ofString());
                    return response;
                } catch (Exception e) {
                    if (AtdTicketApplication.DEBUG_STATUS) System.out.println("Error at @getRequest : " + e.getMessage());
                }
            }
            return null;
        } catch (Exception e) {
            if (AtdTicketApplication.DEBUG_STATUS) System.out.println("Error at @getRequest : " + e.getMessage());
            return null;
        }
    }

    public static HttpResponse<String> postRequest(String endpoint, String body, String contentType) {
        try {
            if (!endpoint.isEmpty() && !body.isEmpty() && !contentType.isEmpty()) {
                String requestStr = AtdTicketApplication.API_BASE_URL + endpoint;
                HttpClient client = HttpClient.newHttpClient();
                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(requestStr))
                        .header("Content-Type", contentType)
                        .header("Cookie", "atdCookie="+ AuthController.getJwt())
                        .POST(HttpRequest.BodyPublishers.ofString(body))
                        .build();
                HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
                return response;
            } else { return null; }
        } catch (Exception e) {
            if (AtdTicketApplication.DEBUG_STATUS) System.out.println("Error at @postRequest : " + e.getMessage());
            return null;
        }
    }

    public static HttpResponse<String> putRequest(String endpoint, String body) {
        try {
            if (!endpoint.isEmpty() && !body.isEmpty()) {
                String requestStr = AtdTicketApplication.API_BASE_URL + endpoint;
                HttpClient client = HttpClient.newHttpClient();
                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(requestStr))
                        .header("Content-Type", FORM_URL_ENCODED)
                        .header("Cookie", "atdCookie="+ AuthController.getJwt())
                        .PUT(HttpRequest.BodyPublishers.ofString(body))
                        .build();
                HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
                return response;
            } else { return null; }
        } catch (Exception e) {
            if (AtdTicketApplication.DEBUG_STATUS) System.out.println("Error at @putRequest : " + e.getMessage());
            return null;
        }
    }

    public static String removeAccents(String str) {
        str = str.replaceAll("é", "e");
        str = str.replaceAll("à", "a");
        str = str.replaceAll("ô", "o");
        str = str.replaceAll("è", "e");
        return str;
    }

    public static Response sendFileRequest(String endpoint, File file) {
        try {
            if (!endpoint.isEmpty() && file.exists() && file.isFile()) {
                String requestStr = AtdTicketApplication.API_BASE_URL + endpoint;
                OkHttpClient okHttpClient = new OkHttpClient();

                String mediaType = Files.probeContentType(file.toPath());
                String finalFilename = removeAccents(file.getName().toLowerCase());
                finalFilename = finalFilename.replaceAll(" ", "-");
                MultipartBody.Builder builder = new MultipartBody.Builder()
                        .setType(MultipartBody.FORM)
                        .addFormDataPart("type", "1")
                        .addFormDataPart("file", finalFilename, RequestBody.create(file, MediaType.parse(mediaType)));

                Request request = new Request.Builder()
                        .url(requestStr)
                        .header("Cookie", "atdCookie=" + AuthController.getJwt())
                        .post(builder.build())
                        .build();

                Response response = okHttpClient.newCall(request).execute();
                return response;
            } else { return null; }
        } catch (Exception e) {
            if (AtdTicketApplication.DEBUG_STATUS) System.out.println("Error at @sendFileRequest : " + e.getMessage());
            return null;
        }
    }
}
