import "zone.js/dist/zone";
import { bootstrapApplication } from "@angular/platform-browser";
import { provideAnimations } from "@angular/platform-browser/animations";
import { SchedulerComponent } from "./app.component";
bootstrapApplication(SchedulerComponent, {
	providers: [
		provideAnimations(),
		// other providers...
	],
});
