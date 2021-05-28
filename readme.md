Propresenter 7 Timer Assist
Written by Bill Meaney
V1.0 released May 28, 2020

Description:

This application is intended to assist in automatically setting a countdown-to-time Timer between repeated events so that no one needs to manually change it between events. The example use case is a church utilizing planning a single Planning Center playlist for multiple services.

Instructions:

1.) Create a Scheduled Task to run on a regular interval (Anywhere between 5 and 30 minutes, suggested that 60 be evenly divided by the number (2, 3, 4, 5, 6, 10, 12, 15, 20, 30)). As a bonus, bound the start time between regular hours of the recurring event.

2.) target the pp7timer.exe in the app directory, and ensure the "start in" directory is also in the same directory.

3.) ensure the ppconfig.txt file remains in the directory

4.) The ppconfig.txt is a JSON file with 5 parameters:
    password: the password for the ProPresenter Control module
    port: the port for ProPresenter Control
    service1: 3 segment, 24-hour time for the first event: "00:00:00" through "23:59:59"
    service2: 3 segment, 24-hour time for the first event: "00:00:00" through "23:59:59"
    timerIndex: the number timer in the list you want to modify. this must be "minus 1". So if you want to modify the first clock, you put 0 as the index