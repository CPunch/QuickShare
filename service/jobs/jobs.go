package jobs

import (
	"context"
	"time"

	"github.com/go-co-op/gocron"
)

func StartJobs(ctx context.Context) {
	sched := gocron.NewScheduler(time.UTC)

	// schedule each job
	sched.Every(60).Seconds().Do(JanitorJob, ctx)

	sched.StartAsync()
}
