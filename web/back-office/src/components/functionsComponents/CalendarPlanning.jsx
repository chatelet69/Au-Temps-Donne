import Timeline, { TimelineHeaders, DateHeader } from 'react-calendar-timeline';
import 'react-calendar-timeline/lib/Timeline.css';
//import moment from 'moment';
import { Component } from 'react';
import ViewPlanningElementPopup from '../myAccountModule/ViewPlanningElementPopup';
import moment from 'moment-timezone';
const baseUrl = require("../../config.json").baseUrl;
moment.tz.setDefault("Europe/Paris");

class CalendarPlanning extends Component {
	state = {
		userId: (this.props.userId) ? this.props.userId : 0,
		volunteers: [],
		dispos: [],
		selected: [],
		planningUpdated: false,
		planningCalendar: "",
		loadingCalendar: false,
		actualDate: new Date().toLocaleDateString("fr-FR"),
		datePlanning: (this.props.date) ? this.props.date : this.state.actualDate,
		editPlanningSelected: false,
		planningSelected: {}
	};

	updatePlanning = () => this.setState({ planningUpdated: true });

	async getAllVolunteers() {
		try {
			let res = await fetch(`${baseUrl}/api/volunteer/allVolunteers`, {
				method: "GET",
				//mode: "no-cors",
				headers: { "Access-Control-Allow-Origin": "origin", },
				credentials: "include"
			});
			let volunteersData = await res.json();
			setTimeout(() => {
				if (volunteersData && !volunteersData.error) {
					volunteersData.volunteers.forEach(volunteer => {
						volunteer.title = volunteer.name;
						if (volunteer.id === this.props.userId) volunteer.title += " (Vous)";
						delete volunteer.lastname;
						delete volunteer.username;
						delete volunteer.name;
					});
					this.setState({ volunteers: volunteersData.volunteers });
				} else {
					return false;
				}
			}, 250);
			return true;
		} catch (error) {
			throw error;
		}
	}

	getFormattedDate(date) {
		const tmpArray = date.split("/");
		return tmpArray[2] + "-" + tmpArray[1] + "-" + tmpArray[0];
	}

	async getAllPlanningOfDay() {
		try {
			this.setState({ dispos: [] });
			let finalUrl = `${baseUrl}/api/volunteers/getAllPlanningOfDay`;
			if (this.state.datePlanning.localeCompare(this.state.actualDate) !== 0) {
				const tmpDate = this.getFormattedDate(this.state.datePlanning);
				finalUrl += `?startDate=${tmpDate}&endDate=${tmpDate}`;
			}
			let res = await fetch(finalUrl, {
				method: "GET",
				credentials: "include"
			});
			let disposData = await res.json();
			if (disposData && !disposData.error) {
				let tmpId = 1;
				disposData.disponibilities.forEach(dispo => {
					dispo.planningId = dispo.id;
					dispo.id = tmpId++;
					dispo.group = dispo.volunteerId;
					dispo.title = (dispo.disponibility_type === 1) ? "Disponible" : dispo.description;
					dispo.bgColor = "rgba(70, 232, 67, 0.75)";
					dispo.start_time = moment().set('hour', parseInt(dispo.datetime_start.split(" ")[1].split(":")[0]));
					dispo.end_time = moment().set('hour', parseInt(dispo.datetime_end.split(" ")[1].split(":")[0]));

					delete dispo.volunteerId;
					delete dispo.volunteerName;
					delete dispo.volunteerLastname;
					delete dispo.datetime_start;
					delete dispo.datetime_end;
					delete dispo.eventId;
				});
				this.setState({ dispos: disposData.disponibilities });
				return true;
			} else {
				return false;
			}
		} catch (error) {
			throw error;
		}
	}

	async componentDidMount() {
		let res = false;
		if (this.props.isPersonnal) {
			res = true;
			this.setState({ volunteers: [{ id: this.props.userId, title: "Vous" }] });
		} else {
			res = this.getAllVolunteers();
		}

		if (res) await this.getAllPlanningOfDay();
	}

	async componentDidUpdate(prevProps, prevState) {
		if (prevState.datePlanning !== this.props.date) {
			this.setState({ datePlanning: this.props.date });
			if (this.state.datePlanning.localeCompare(this.props.date) === 0) await this.getAllPlanningOfDay();
		}
		if (this.props.planningUpdated && prevState.planningUpdated !== this.props.planningUpdated) await this.getAllPlanningOfDay();
		if (this.state.planningUpdated && prevState.planningUpdated !== this.state.planningUpdated) await this.getAllPlanningOfDay();
	}

	itemRenderer = ({ item, timelineContext, itemContext, getItemProps, getResizeProps }) => {
		const { left: leftResizeProps, right: rightResizeProps } = getResizeProps();
		//let backgroundColor = itemContext.selected ? (itemContext.dragging ? "red" : item.selectedBgColor) : item.bgColor;
		const backgroundColor = (item.disponibility_type) ? item.bgColor : "#dc143c";
		return (
			<div
				{...getItemProps({
					style: {
						backgroundColor,
						color: (item.disponibility_type) ? item.color : "white",
						borderColor: "transparent",
						borderStyle: "none",
						borderWidth: 0,
						borderRadius: 4,
						borderLeftWidth: itemContext.selected ? 3 : 1,
						borderRightWidth: itemContext.selected ? 3 : 1
					}
				})}
			>
				{itemContext.useResizeHandle ? <div {...leftResizeProps} /> : null}

				<div
					style={{
						height: itemContext.dimensions.height,
						overflow: "hidden",
						paddingLeft: 3,
						textAlign: "center",
						textOverflow: "ellipsis",
						whiteSpace: "nowrap"
					}}
					id={item.planningId}
				>
					{itemContext.title}
				</div>

				{itemContext.useResizeHandle ? <div {...rightResizeProps} /> : null}
			</div>
		);
	};

	itemClicked = (itemId, e, time) => {
		if (this.props.isPersonnal) {
			this.setState({ editPlanningSelected: true });
			this.setState({ planningIdToGet: e.target.id });
		} else {
			this.setState({ selected: [] });
		}
	}

	render() {
		if (this.state.volunteers.length > 0) {
			return (
				<>
					<Timeline
						groups={this.state.volunteers}
						items={this.state.dispos}
						visibleTimeStart={moment().set('hour', 7)}
						visibleTimeEnd={moment().set('hour', 23)}
						canMove={false}
						canResize={false}
						itemHeightRatio={0.85}
						lineHeight={40}

						// Next 3 lines serve to "disable" if needed the item selection / click event
						selected={this.state.selected}
						onItemSelect={this.itemClicked}
						onItemClick={this.itemClicked}
						itemRenderer={this.itemRenderer}
					>
						<TimelineHeaders>
							<DateHeader labelFormat="HH" unit="hour" />
						</TimelineHeaders>
					</Timeline >
					{
						this.state.editPlanningSelected &&
						<ViewPlanningElementPopup
							closePopup={() => this.setState({ editPlanningSelected: false, planningSelected: {} })}
							userId={this.state.userId}
							userPlanningUpdated={() => this.updatePlanning()}
							planningIdToGet={this.state.planningIdToGet}
						/>
					}
				</>
			);
		} else {
			return (
				<div className="loading-planning-box text-center">
					<h3>Récupération du planning en cours</h3>
					<div><span className="sync-icon material-symbols-outlined">sync</span></div>
				</div>
			);
		}
	}
}

export default CalendarPlanning;