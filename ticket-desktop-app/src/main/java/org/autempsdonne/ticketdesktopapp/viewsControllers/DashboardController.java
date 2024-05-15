package org.autempsdonne.ticketdesktopapp.viewsControllers;

import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.scene.control.Alert;
import javafx.scene.control.Button;
import javafx.scene.control.ComboBox;
import javafx.scene.control.Label;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.scene.shape.Rectangle;
import org.autempsdonne.ticketdesktopapp.AtdTicketApplication;
import org.autempsdonne.ticketdesktopapp.AuthController;
import org.autempsdonne.ticketdesktopapp.models.Ticket;
import org.autempsdonne.ticketdesktopapp.models.TicketMessage;
import org.autempsdonne.ticketdesktopapp.models.TicketStatusMessage;
import org.autempsdonne.ticketdesktopapp.services.TicketService;

import java.util.List;

public class DashboardController {
    private final TicketService ticketService = new TicketService();
    @FXML public Label dashboardTitleText;
    public Label welcomeUserText;
    public Label ticketsAmountText;
    public VBox ticketsListContainer;
    public ComboBox filterDifficultyTicketComboBox;
    public ComboBox filterStatusTicketComboBox;
    @FXML private Label welcomeText;
    private static final int STATUS_TYPE = 1;
    private static final int DIFFICULTY_TYPE = 2;
    private static final int ALL_STATUS = 2;
    private static final int ALL_DIFFICULTIES = 4;

    @FXML protected void initialize() {
        if (AuthController.getUser() != null) welcomeUserText.setText("Bienvenue " + AuthController.getUser().getUsername());
        this.initTicketsList();
        filterDifficultyTicketComboBox.setValue("N'importe");
        filterStatusTicketComboBox.setValue("N'importe");
    }
    
    private void initTicketsList() {
        ticketService.fetchTicketsFromApi();
        List<Ticket> ticketList = ticketService.getTicketList();
        if (!ticketsListContainer.getChildren().isEmpty()) ticketsListContainer.getChildren().clear();
        if (!ticketList.isEmpty()) {
            ticketsAmountText.setText("Il y a " + String.valueOf(ticketList.size()) + " ticket(s) !");
            for (Ticket ticket : ticketList) {
                HBox ticketBox = this.createTicketBox(ticket);
                if (ticketBox != null) ticketsListContainer.getChildren().add(ticketBox);
            }
        } else {
            ticketsAmountText.setText("Aucun ticket en base de données !");
        }
    }

    private HBox createTicketBox(Ticket ticket) {
        try {
            FXMLLoader eventRowLoader = new FXMLLoader(AtdTicketApplication.class.getResource("row-ticket.fxml"));
            HBox ticketRowBox = eventRowLoader.load();
            ticketRowBox.setSpacing(10);

            Label ticketBoxTitle = (Label) ticketRowBox.lookup("#ticketBoxTitle");
            if (ticketBoxTitle != null) ticketBoxTitle.setText(ticket.getTitle());

            Label ticketBoxStatus = (Label) ticketRowBox.lookup("#ticketBoxStatus");
            if (ticketBoxStatus != null) ticketBoxStatus.setText((ticket.getStatus() == Ticket.CLOSED_STATUS) ? "Fermé" : "Ouvert");

            Label ticketBoxDifficulty = (Label) ticketRowBox.lookup("#ticketBoxDifficulty");
            if (ticketBoxDifficulty != null) ticketBoxDifficulty.setText(TicketMessage.difficultiesName.get(ticket.getDifficulty()));

            Label ticketBoxCategory = (Label) ticketRowBox.lookup("#ticketBoxCategory");
            if (ticketBoxCategory != null) ticketBoxCategory.setText(ticket.getCategory());

            Label ticketBoxDate = (Label) ticketRowBox.lookup("#ticketBoxDate");
            if (ticketBoxDate != null) ticketBoxDate.setText(ticket.getDate());

            Button goToTicket = this.createSelectTicketButton(ticket);
            goToTicket.getStyleClass().add("hover-cursor");
            goToTicket.getStyleClass().add("ticket-action-button");

            //Button closeTicket = this.getCloseTicket(ticket.getId(), ticket.getStatus());
            ticketRowBox.getChildren().addAll(goToTicket);

            //Rectangle ticketDifficultyColorBlock = (Rectangle) ticketRowBox.lookup("#ticketDifficultyColorBlock");
            ticketRowBox.getStyleClass().add("ticket-difficulty-"+ticket.getDifficulty());
            ticketRowBox.getStyleClass().add("ticket-list-element-box");

            return ticketRowBox;
        } catch (Exception e) {
            if (AtdTicketApplication.DEBUG_STATUS) System.out.println("Error at createTicketBox : " + e.getMessage());
            return null;
        }
    }

    private Button getCloseTicket(int ticketId, int status) {
        Button closeTicket = this.createCloseTicketButton(ticketId, status);
        closeTicket.getStyleClass().add("hover-cursor");
        closeTicket.getStyleClass().add("ticket-action-button");
        if (status == Ticket.CLOSED_STATUS) closeTicket.setText("Réouvrir le ticket");
        return closeTicket;
    }

    private Button createSelectTicketButton(Ticket ticket) {
        Button selectTicket = new Button("Sélectionner");
        selectTicket.setOnAction(actionEvent -> {
            ViewsController.switchToView("ticket-view", ticket);
        });
        return selectTicket;
    }

    private Button createCloseTicketButton(int ticketId, int ticketStatus) {
        Button closeTicket = new Button("Fermer le ticket");
        closeTicket.setOnAction(actionEvent -> {
            Alert alert = new Alert(Alert.AlertType.INFORMATION);
            alert.setTitle("Fermeture du ticket " + ticketId);
            alert.setHeaderText(null);

            if (ticketStatus != Ticket.CLOSED_STATUS) {
                boolean res = TicketService.changeTicketStatus(ticketId, Ticket.CLOSED_STATUS);
                if (res) alert.setContentText(TicketStatusMessage.TICKET_HAS_BEEN_CLOSED.getTicketStatusMessage());
                else alert.setContentText("Impossible de fermer le ticket");
            } else {
                alert.setContentText(TicketStatusMessage.TICKET_ALREADY_CLOSED.getTicketStatusMessage());
            }
            alert.showAndWait();
        });
        return closeTicket;
    }

    public void saveNewFilterStatus() {
        try {
            this.updateTicketsListByType();
        } catch (Exception e) {
            if (AtdTicketApplication.DEBUG_STATUS) System.out.println("Error at saveNewFilterStatus : " + e.getMessage());
        }
    }

    public void updateTicketsListByType() {
        try {
            String selectedDiff = filterDifficultyTicketComboBox.getValue().toString();
            int diffCode = (selectedDiff.equalsIgnoreCase("N'importe")) ? ALL_DIFFICULTIES : TicketMessage.difficultiesValues.get(selectedDiff);
            String selectedStatus = filterStatusTicketComboBox.getValue().toString();
            int statusCode = (selectedStatus.equals("N'importe")) ? 2 : (selectedStatus.equals("Clot")) ? Ticket.CLOSED_STATUS : Ticket.OPENED_STATUS;

            if (diffCode == ALL_DIFFICULTIES && statusCode == ALL_STATUS) {
                this.initTicketsList();
            } else {
                ticketsListContainer.getChildren().clear();
                List<Ticket> ticketList = ticketService.getTicketList();
                if (!ticketList.isEmpty()) {
                    int count = 0;
                    for (Ticket ticket : ticketList) {
                        if (
                                (ticket.getDifficulty() == diffCode || diffCode == ALL_DIFFICULTIES) &&
                                        (ticket.getStatus() == statusCode || statusCode == ALL_STATUS)
                        ) {
                            HBox ticketBox = this.createTicketBox(ticket);
                            ticketsListContainer.getChildren().add(ticketBox);
                            count++;
                        }
                        ticketsAmountText.setText("Il y a " + String.valueOf(count) + " ticket(s) !");
                    }
                } else {
                    ticketsAmountText.setText("Aucun ticket avec ce filtre en base de données !");
                }
            }
        } catch (Exception e) {
            if (AtdTicketApplication.DEBUG_STATUS) System.out.println("Error at updateTicketsListByStatus : " + e.getMessage());
        }
    }

    public void saveNewfilterDifficulty() {
        try {
            this.updateTicketsListByType();
        } catch (Exception e) {
            if (AtdTicketApplication.DEBUG_STATUS) System.out.println("Error at saveNewfilterDifficulty : " + e.getMessage());
        }
    }
}