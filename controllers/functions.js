const getWeeks = (startOfWeek = 'saturday', numberOfPreviousWeeks = 4) => {
    let weeks = [];
    const arr = [0, 1, 2, 3, 4, 5, 6];
    const obj = { 'saturday': 6, 'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3, 'thursday': 4, 'friday': 5 };
    const arrReadableElement = (element) => {
        const index = element >= 0 ? element : arr.length + element;
        return arr[index];
    }

    const today = new Date();
    today.setUTCHours(today.getUTCHours() + 3);
    let startOfThisWeek = new Date(today);
    startOfThisWeek.setUTCDate(today.getUTCDate() - arrReadableElement(today.getUTCDay() - obj[startOfWeek]));
    startOfThisWeek.setUTCHours(0, 0, 0, 0);
    let endOfThisWeek = new Date(startOfThisWeek);
    endOfThisWeek.setUTCDate(startOfThisWeek.getUTCDate() + 6);
    endOfThisWeek.setUTCHours(23, 59, 59, 999);
    weeks.push({ start: startOfThisWeek, end: endOfThisWeek })
    for (let i = 1; i < numberOfPreviousWeeks; i++) {
        let start = new Date(startOfThisWeek);
        start.setUTCDate(startOfThisWeek.getUTCDate() - (i * 7));
        let end = new Date(endOfThisWeek);
        end.setUTCDate(endOfThisWeek.getUTCDate() - (i * 7));
        weeks.push({ start, end });
    }

    return weeks;
}

module.exports = {
    getWeeks
};