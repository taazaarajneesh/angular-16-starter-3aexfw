import {
	Component,
	OnInit,
	signal,
	computed,
	ViewChild,
	ElementRef,
	AfterViewInit,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import {
	FullCalendarModule,
	FullCalendarComponent,
} from "@fullcalendar/angular";
import {
	CalendarOptions,
	EventClickArg,
	EventInput,
	EventSourceInput,
	Calendar,
} from "@fullcalendar/core";
import { DateClickArg } from "@fullcalendar/interaction";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import multiMonthPlugin from "@fullcalendar/multimonth";

interface ExtendedEventInput extends EventInput {
	extendedProps?: {
		important?: boolean;
		category?: string;
	};
}

@Component({
	selector: "app-scheduler",
	standalone: true,
	imports: [CommonModule, FormsModule, FullCalendarModule],
	templateUrl: "app.component.html",
	styleUrls: [`app.component.scss`],
})
export class SchedulerComponent implements OnInit, AfterViewInit {
	@ViewChild("calendar") calendarComponent!: FullCalendarComponent;
	@ViewChild("miniCalendar") miniCalendarEl!: ElementRef;

	selectedDate = signal<string>("");
	events = signal<ExtendedEventInput[]>([
		{
			title: "Important Work Event",
			start: new Date(),
			extendedProps: { important: true, category: "work" },
		},
		{
			title: "Personal Event",
			start: new Date(new Date().setDate(new Date().getDate() + 1)),
			extendedProps: { category: "personal" },
		},
		{
			title: "Regular Work Event",
			start: new Date(new Date().setDate(new Date().getDate() + 2)),
			extendedProps: { category: "work" },
		},
	]);

	selectedDateEvents = computed(() =>
		this.events().filter((event) => {
			const eventStart =
				event.start instanceof Date
					? event.start
					: new Date(event.start as string);
			return this.isSameDay(eventStart, new Date(this.selectedDate()));
		})
	);

	calendarOptions: CalendarOptions = {
		plugins: [dayGridPlugin, interactionPlugin, multiMonthPlugin],
		initialView: "dayGridMonth",
		headerToolbar: {
			left: "prev,next today",
			center: "title",
			right: "dayGridMonth,dayGridWeek,dayGridDay,multiMonthYear",
		},
		views: {
			multiMonthYear: {
				type: "multiMonth",
				duration: { years: 1 },
				monthMode: "static",
				titleFormat: { year: "numeric" },
			},
		},
		events: this.events() as EventSourceInput,
		dateClick: this.handleDateClick.bind(this),
		eventClick: this.handleEventClick.bind(this),
	};

	// Filter options
	showImportant = false;
	selectedCategory = "";

	selectedYear = new Date().getFullYear();
	selectedMonth = new Date().getMonth();

	miniCalendar!: Calendar;

	constructor() {}

	ngOnInit() {
		this.selectedDate.set(this.toLocalDateString(new Date()));
	}

	ngAfterViewInit() {
		setTimeout(() => {
			this.initMiniCalendar();
		}, 0);
	}

	initMiniCalendar() {
		this.miniCalendar = new Calendar(this.miniCalendarEl.nativeElement, {
			plugins: [dayGridPlugin, interactionPlugin],
			initialView: "dayGridMonth",
			headerToolbar: {
				left: "prev",
				center: "title",
				right: "next",
			},
			height: "auto",
			aspectRatio: 1.35,
			dayHeaderFormat: { weekday: "narrow" },
			dateClick: (arg) => {
				this.goToSelectedDate(arg.date);
			},
		});
		this.miniCalendar.render();
	}

	handleDateClick(arg: DateClickArg) {
		this.goToSelectedDate(arg.date);
	}

	handleEventClick(arg: EventClickArg) {
		console.log("Event clicked:", arg.event.title);
	}

	applyFilters() {
		const filteredEvents = this.events().filter((event) => {
			if (this.showImportant && event.extendedProps?.important !== true) {
				return false;
			}
			if (
				this.selectedCategory &&
				event.extendedProps?.category !== this.selectedCategory
			) {
				return false;
			}
			return true;
		});

		const calendarApi = this.calendarComponent.getApi();
		calendarApi.removeAllEvents();
		calendarApi.addEventSource(filteredEvents);
	}

	updateMiniCalendar() {
		// This method can be expanded to update a visual mini-calendar if needed
	}

	goToSelectedDate(date: Date) {
		const localDate = this.toLocalDateString(date);
		this.selectedDate.set(localDate);
		const calendarApi = this.calendarComponent.getApi();
		calendarApi.gotoDate(localDate);
		this.miniCalendar.gotoDate(localDate);
	}

	private toLocalDateString(date: Date): string {
		const year = date.getFullYear();
		const month = (date.getMonth() + 1).toString().padStart(2, "0");
		const day = date.getDate().toString().padStart(2, "0");
		return `${year}-${month}-${day}`;
	}

	private isSameDay(date1: Date, date2: Date): boolean {
		return (
			date1.getFullYear() === date2.getFullYear() &&
			date1.getMonth() === date2.getMonth() &&
			date1.getDate() === date2.getDate()
		);
	}
}
