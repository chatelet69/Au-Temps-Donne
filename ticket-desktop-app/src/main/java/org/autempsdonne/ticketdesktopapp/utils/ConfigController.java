package org.autempsdonne.ticketdesktopapp.utils;

public class ConfigController {
    static public final double MIN_HEIGHT = 520.0;
    static public final double MIN_WIDTH = 760.0;
    static public final double DEFAULT_HEIGHT = 648.0;
    static public final double DEFAULT_WIDTH = 1024.0;
    static private double actualHeight = DEFAULT_HEIGHT;
    static private double actualWidth = DEFAULT_WIDTH;

    // Getters
    static public double getActualHeight() { return actualHeight; }

    static public double getActualWidth() { return actualWidth; }

    // Setters
    static public void setActualHeight(double height) { actualHeight = height; }

    static public void setActualWidth(double width) { actualWidth = width; }
}
