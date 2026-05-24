const businessHours = {
  0: [],
  1: [["17:30", "20:00"]],
  2: [["10:00", "14:00"], ["17:30", "20:00"]],
  3: [["10:00", "14:00"], ["17:30", "20:00"]],
  4: [["10:00", "14:00"], ["17:30", "20:00"]],
  5: [["10:00", "14:00"], ["17:30", "20:00"]],
  6: [["11:00", "14:00"]]
};

const weekdayNames = [
  "Domingo",
  "Lunes",
  "Martes",
  "Mi\u00e9rcoles",
  "Jueves",
  "Viernes",
  "S\u00e1bado"
];

function getMadridParts() {
  const formatter = new Intl.DateTimeFormat("es-ES", {
    timeZone: "Europe/Madrid",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });

  const parts = formatter.formatToParts(new Date());
  const valueOf = (type) => parts.find((part) => part.type === type)?.value ?? "";
  const weekdayMap = {
    dom: 0,
    lun: 1,
    mar: 2,
    "mi\u00e9": 3,
    jue: 4,
    vie: 5,
    "s\u00e1b": 6
  };

  const weekdayShort = valueOf("weekday").toLowerCase().replace(".", "");

  return {
    day: weekdayMap[weekdayShort],
    minutesNow: Number(valueOf("hour")) * 60 + Number(valueOf("minute"))
  };
}

function toMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatDayRanges(day) {
  const ranges = businessHours[day] ?? [];
  return ranges.length ? ranges.map((range) => range.join(" - ")).join(" / ") : "Cerrado";
}

function updateBusinessStatus() {
  const todayHoursElement = document.querySelector("#today-hours");
  const statusElement = document.querySelector("#open-status");

  if (!todayHoursElement || !statusElement) {
    return;
  }

  const { day, minutesNow } = getMadridParts();
  const ranges = businessHours[day] ?? [];
  const isOpen = ranges.some(([start, end]) => {
    const startMinutes = toMinutes(start);
    const endMinutes = toMinutes(end);
    return minutesNow >= startMinutes && minutesNow < endMinutes;
  });

  todayHoursElement.textContent = `${weekdayNames[day]}: ${formatDayRanges(day)}`;
  statusElement.textContent = isOpen ? "Abierto ahora" : "Cerrado ahora";
  statusElement.dataset.state = isOpen ? "open" : "closed";
}

function updateFooterYear() {
  const yearElement = document.querySelector("#current-year");

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}

function setupRevealObserver() {
  const items = document.querySelectorAll("[data-reveal]");

  if (!items.length) {
    return;
  }

  if (!("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -30px 0px"
    }
  );

  items.forEach((item) => observer.observe(item));
}

function setupHeaderState() {
  const header = document.querySelector(".site-header");

  if (!header) {
    return;
  }

  const updateState = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  };

  updateState();
  window.addEventListener("scroll", updateState, { passive: true });
}

updateBusinessStatus();
updateFooterYear();
setupRevealObserver();
setupHeaderState();
window.setInterval(updateBusinessStatus, 60000);
