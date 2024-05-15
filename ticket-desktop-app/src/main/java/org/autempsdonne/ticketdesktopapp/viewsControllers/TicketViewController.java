package org.autempsdonne.ticketdesktopapp.viewsControllers;

import javafx.animation.Animation;
import javafx.animation.KeyFrame;
import javafx.animation.Timeline;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.geometry.Pos;
import javafx.scene.control.*;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.stage.FileChooser;
import javafx.util.Duration;
import org.autempsdonne.ticketdesktopapp.AtdTicketApplication;
import org.autempsdonne.ticketdesktopapp.AuthController;
import org.autempsdonne.ticketdesktopapp.models.Ticket;
import org.autempsdonne.ticketdesktopapp.models.TicketMessage;
import org.autempsdonne.ticketdesktopapp.models.TicketStatusMessage;
import org.autempsdonne.ticketdesktopapp.services.TicketChatService;
import org.autempsdonne.ticketdesktopapp.services.TicketService;

import java.io.File;
import java.util.List;

public class TicketViewController {
    public Label ticketTitleText;
    public Label ticketDescriptionText;
    public Label ticketDateText;
    public VBox ticketChatContainer;
    public Label noMessageInTicketChat;
    public TextField chatMessageTextField;
    public Label fileNameSelected;
    public ComboBox difficultyTicketComboBox;
    public Button changeStatusButton;
    public Label ticketCategoryText;
    public Label ticketCategoryStatus;
    private Ticket ticket;
    private TicketChatService ticketChatService;
    private static File fileSelectedToSend = null;
    private static Timeline timeline = null;

    @FXML protected void initialize(Ticket ticket) {
        this.ticket = ticket;
        this.ticketChatService = new TicketChatService();
        if (ticket != null) {
            this.initTicketData();
            this.initTicketDifficulty();
        }

        timeline = new Timeline(new KeyFrame(Duration.seconds(5), e -> this.refreshChat()));
        timeline.setCycleCount(Animation.INDEFINITE);
        timeline.playFromStart();
    }

    @FXML protected void deinitialize() {
        timeline.stop();
        timeline = null;
        this.ticketChatService = null;
        this.ticket = null;
    }

    public Ticket getTicket() { return this.ticket; }

    public void setTicket(Ticket ticket) { this.ticket = ticket; }

    public void initTicketData() {
        try {
            ticketTitleText.setText(this.ticket.getTitle());
            ticketDescriptionText.setText(this.ticket.getDescription());
            ticketCategoryText.setText(this.ticket.getCategory());
            ticketCategoryStatus.setText((this.ticket.getStatus() == Ticket.CLOSED_STATUS) ? "Clot" : "Ouvert");
            if (this.ticket.getDate() != null) ticketDateText.setText(this.ticket.getDate());

            this.ticketChatService.fetchTicketChat(this.ticket.getId());
            if (this.ticketChatService.getTicketMessageListSize() > 0) {
                noMessageInTicketChat.setText("");
                noMessageInTicketChat.setVisible(false);
                noMessageInTicketChat.setManaged(false);
                this.initTicketChatData();
            }
        } catch (Exception e) {
            if (AtdTicketApplication.DEBUG_STATUS) System.out.println("Error at initTicketData : " + e.getMessage());
        }
    }

    private void initTicketDifficulty() {
        try {
            ObservableList<String> difficulties = FXCollections.observableArrayList(TicketMessage.difficultiesName.values());
            difficultyTicketComboBox.setValue(TicketMessage.difficultiesName.get(this.ticket.getDifficulty()));
            difficultyTicketComboBox.setItems(difficulties);
            String statusColorClass = (this.ticket.getStatus() == Ticket.OPENED_STATUS) ? "resolve-ticket-color" : "open-ticket-color";
            changeStatusButton.getStyleClass().add(statusColorClass);
            if (this.ticket.getStatus() == Ticket.CLOSED_STATUS) changeStatusButton.setText("Ouvrir le ticket");
        } catch (Exception e) {
            if (AtdTicketApplication.DEBUG_STATUS) System.out.println("Error at initTicketDifficulty : " + e.getMessage());
        }
    }

    public void initTicketChatData() {
        try {
            List<TicketMessage> messages = this.ticketChatService.getTicketMessageList();
            for (TicketMessage message : messages) {
                boolean isUserAuthor = message.getAuthorId() == AuthController.getUser().getId();
                String messageTypeResource = (isUserAuthor) ? "row-ticket-message-author.fxml" : "row-ticket-message-other.fxml";
                FXMLLoader messageBoxLoader = new FXMLLoader(AtdTicketApplication.class.getResource(messageTypeResource));
                HBox messageBox = messageBoxLoader.load();
                messageBox.setId("message-box-"+String.valueOf(message.getId()));

                String userPfpLink = (isUserAuthor) ? AuthController.getUser().getPfp() : AuthController.getUserPfpPath(message.getAuthorId());
                Image userPfp = new Image(userPfpLink);

                if (isUserAuthor) {
                    messageBox.setAlignment(Pos.TOP_RIGHT);
                }

                Label ticketMessageAuthorName = (Label) messageBox.lookup("#ticketMessageAuthorName");
                if (ticketMessageAuthorName != null) ticketMessageAuthorName.setText(message.getUsername());

                ImageView userPfpView = (ImageView) messageBox.lookup("#userPfpView");
                if (userPfpView != null) userPfpView.setImage(userPfp);

                VBox ticketMessageBoxContainer = (VBox) messageBox.lookup("#ticketMessageBoxContainer");
                if (ticketMessageBoxContainer != null) {
                    if (message.getType() == TicketMessage.FILE_MESSAGE) {
                        Image image = new Image(message.getMessage());
                        ImageView imageView = new ImageView(image);
                        imageView.getStyleClass().add("message-image-box");
                        imageView.setPreserveRatio(true);
                        imageView.setFitWidth(300.0);
                        //imageView.setFitHeight();
                        ticketMessageBoxContainer.getChildren().add(imageView);
                    } else {
                        Label messageLabel = new Label(message.getMessage());
                        messageLabel.getStyleClass().add((isUserAuthor) ? "message-author-box" : "message-other-box");
                        messageLabel.getStyleClass().add("message-box");
                        ticketMessageBoxContainer.getChildren().add(messageLabel);
                    }
                }

                ticketChatContainer.getChildren().add(messageBox);
            }
        } catch (Exception e) {
            if (AtdTicketApplication.DEBUG_STATUS) System.out.println("Error at initTicketChatData : " + e.getMessage());
        }
    }

    public void goBackToMenuFromTicket() {
        try {
            this.deinitialize();
            ViewsController.switchToView(ViewsController.DASHBOARD_VIEW);
        } catch (Exception e) {
            if (AtdTicketApplication.DEBUG_STATUS) System.out.println("Error at goBackToMenuFromTicket : " + e.getMessage());
        }
    }

    public void showMessageAlert(Alert.AlertType alertType, String content) {
        try {
            Alert alert = new Alert(alertType);
            alert.setTitle("Tentative d'envoi de message");
            alert.setHeaderText(null);
            alert.setContentText(content);
            alert.showAndWait();
        } catch (Exception e) {
            if (AtdTicketApplication.DEBUG_STATUS) System.out.println("Error at showMessageToLongAlert : " + e.getMessage());
        }
    }

    public void sendMessageTicketChatAction() {
        try {
            String message = this.chatMessageTextField.getText();
            if (!message.isEmpty()) {
                if (message.length() > 255) {
                    this.showMessageAlert(Alert.AlertType.ERROR, "Le message dépasse la taille autorisée (255 caractères)");
                } else {
                    boolean check = this.ticketChatService.sendTicketMessage(this.ticket.getId(), message);
                    if (check) this.ticketChatService.fetchTicketChat(this.ticket.getId());
                    else this.showMessageAlert(Alert.AlertType.ERROR, "Erreur durant l'envoi du message au serveur");
                    this.refreshChat();
                }
            }

            if (fileSelectedToSend.exists() && fileSelectedToSend.exists()) {
                boolean check = this.ticketChatService.sendTicketFile(this.ticket.getId(), fileSelectedToSend);
                if (check) this.ticketChatService.fetchTicketChat(this.ticket.getId());
                else this.showMessageAlert(Alert.AlertType.ERROR, "Erreur durant l'envoi du fichier au serveur");
                this.refreshChat();
            }
        } catch (Exception e) {
            if (AtdTicketApplication.DEBUG_STATUS) System.out.println("Error at sendMessageTicketChatAction : " + e.getMessage());
        }
    }

    public void refreshChat() {
        try {
            int oldSize = this.ticketChatService.getTicketMessageListSize();
            this.ticketChatService.fetchTicketChat(this.ticket.getId());
            if (this.ticketChatService.getTicketMessageListSize() > 0 && oldSize != this.ticketChatService.getTicketMessageListSize()) {
                ticketChatContainer.getChildren().clear();
                this.initTicketChatData();
            }
        } catch (Exception e) {
            if (AtdTicketApplication.DEBUG_STATUS) System.out.println("Error at refreshChat : " + e.getMessage());
        }
    }

    public void uploadFileToSendAction(ActionEvent actionEvent) {
        try {
            FileChooser fileChooser = new FileChooser();
            File selectedFile = fileChooser.showOpenDialog(AtdTicketApplication.getMainStage());
            if (selectedFile != null && selectedFile.exists()) {
                fileSelectedToSend = selectedFile;
                String filename = selectedFile.getName();
                fileNameSelected.setText(filename);
            }
        } catch (Exception e) {
            if (AtdTicketApplication.DEBUG_STATUS) System.out.println("Error at uploadFileToSendAction : " + e.getMessage());
        }
    }

    public void saveNewDifficultyAction() {
        try {
            String difficultyName = difficultyTicketComboBox.getValue().toString();
            String oldDifficulty = TicketMessage.difficultiesName.get(this.ticket.getDifficulty());
            if (this.ticket.getStatus() == Ticket.CLOSED_STATUS) {
                ViewsController.showInfoAlert(
                        Alert.AlertType.INFORMATION,
                        "Changement de priorité",
                        "Impossible de changer la priorité d'un ticket fermé !"
                );
                difficultyTicketComboBox.setValue(oldDifficulty);
            } else {
                if (!difficultyName.isEmpty() && !difficultyName.equals(oldDifficulty)) {
                    int newDiff = TicketMessage.difficultiesValues.get(difficultyName);
                    this.ticket.setDifficulty(newDiff);
                    boolean check = this.ticketChatService.changeTicketDifficulty(this.ticket.getId(), newDiff);
                    if (check) ViewsController.showInfoAlert(Alert.AlertType.INFORMATION, "Informations du ticket", "La priorité a bien été modifiée !");
                }
            }
        } catch (Exception e) {
            if (AtdTicketApplication.DEBUG_STATUS) System.out.println("Error at saveNewDifficultyAction : " + e.getMessage());
        }
    }

    public void changeStatusTicketAction(ActionEvent actionEvent) {
        try {
            if (this.ticket.getStatus() != Ticket.CLOSED_STATUS) {
                this.ticket.setStatus(Ticket.CLOSED_STATUS);
                boolean check = TicketService.changeTicketStatus(this.ticket.getId(), Ticket.CLOSED_STATUS);
                if (check) {
                    ViewsController.showInfoAlert(Alert.AlertType.INFORMATION,
                            "Fermeture du ticket", TicketStatusMessage.TICKET_HAS_BEEN_CLOSED.getTicketStatusMessage());
                    ViewsController.switchToView(ViewsController.DASHBOARD_VIEW);
                } else {
                    showMessageAlert(Alert.AlertType.ERROR, "Erreur durant la fermeture du ticket");
                }
            } else {
                this.ticket.setStatus(Ticket.OPENED_STATUS);
                boolean check = TicketService.changeTicketStatus(this.ticket.getId(), Ticket.OPENED_STATUS);
                if (check) {
                    ViewsController.showInfoAlert(Alert.AlertType.INFORMATION, "Ouverture du ticket", TicketStatusMessage.TICKET_HAS_BEEN_OPENED.getTicketStatusMessage());
                    this.updateStatusTicketView();
                } else {
                    showMessageAlert(Alert.AlertType.ERROR, "Erreur durant l'ouverture du ticket");
                }
            }
        } catch (Exception e) {
            if (AtdTicketApplication.DEBUG_STATUS) System.out.println("Error at changeStatusTicketAction : " + e.getMessage());
        }
    }

    private void updateStatusTicketView() {
        try {
            ticketCategoryStatus.setText((this.ticket.getStatus() == Ticket.CLOSED_STATUS) ? "Clot" : "Ouvert");
            String statusColorClass = (this.ticket.getStatus() == Ticket.OPENED_STATUS) ? "resolve-ticket-color" : "open-ticket-color";
            changeStatusButton.getStyleClass().add(statusColorClass);
            if (this.ticket.getStatus() == Ticket.CLOSED_STATUS) changeStatusButton.setText("Ouvrir le ticket");
            else changeStatusButton.setText("Résoudre le ticket");
        } catch (Exception e) {
            if (AtdTicketApplication.DEBUG_STATUS) System.out.println("Error at updateStatusTicketView : " + e.getMessage());
        }
    }
}
