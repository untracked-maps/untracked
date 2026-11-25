# Feature: Show the passages and the exits of a station

> The visitor opens the sheet of a station. It tells the next departures of
> each line, in each direction, and the exits of the station. While the sheet
> stays open and the page is shown, the departures are asked again every 30
> seconds, and the time they are counted from moves on every 10 seconds.

## Rule: One line of departures per line and per destination

### Background:

- Given the station "nord" served by these lines
  | id  | route master | ref | colour  | text colour |
  | --- | ------------ | --- | ------- | ----------- |
  | m4  | subway       | 4   | #CF009E | #FFFFFF     |
  | m5  | subway       | 5   | #FF7E2E | #000000     |
  | rb  | train        | B   | #5091CB | #FFFFFF     |
  | t3  | tram         | 3a  | #FF7E2E | #000000     |
  | b38 | bus          | 38  | #0055C8 | #FFFFFF     |
  | m10 | subway       | 10  | #C9910D | #000000     |
- And it is 10:00:00

### Scenario: Each direction of a line has its own line of departures

- Given these departures
  | line | destination           | at       |
  | ---- | --------------------- | -------- |
  | m4   | Porte de Clignancourt | 10:02:00 |
  | m4   | Bagneux–Lucie Aubrac  | 10:03:00 |
  | m4   | Porte de Clignancourt | 10:06:00 |
- When the visitor opens the station "nord"
- Then the departures read "4 Porte de Clignancourt: 2 min, 6 min; 4 Bagneux–Lucie Aubrac: 3 min"

### Scenario: The metro comes first, then trains and RER, then trams, and never buses

- Given these departures
  | line | destination         | at       |
  | ---- | ------------------- | -------- |
  | t3   | Porte de Vincennes  | 10:01:00 |
  | b38  | Porte d'Orléans     | 10:01:00 |
  | rb   | Massy-Palaiseau     | 10:02:00 |
  | m4   | Mairie de Montrouge | 10:05:00 |
- When the visitor opens the station "nord"
- Then the departures read "4 Mairie de Montrouge: 5 min; B Massy-Palaiseau: 2 min; 3a Porte de Vincennes: 1 min"

### Scenario: Lines of the same mode follow their numbers, 5 before 10

- Given these departures
  | line | destination       | at       |
  | ---- | ----------------- | -------- |
  | m10  | Gare d'Austerlitz | 10:01:00 |
  | m5   | Place d'Italie    | 10:04:00 |
- When the visitor opens the station "nord"
- Then the departures read "5 Place d'Italie: 4 min; 10 Gare d'Austerlitz: 1 min"

### Scenario: Two directions of the same line follow their first departure

- Given these departures
  | line | destination           | at       |
  | ---- | --------------------- | -------- |
  | m4   | Porte de Clignancourt | 10:07:00 |
  | m4   | Bagneux–Lucie Aubrac  | 10:03:00 |
- When the visitor opens the station "nord"
- Then the departures read "4 Bagneux–Lucie Aubrac: 3 min; 4 Porte de Clignancourt: 7 min"

### Scenario: Three departures at most per line

- Given these departures
  | line | destination           | at       |
  | ---- | --------------------- | -------- |
  | m4   | Porte de Clignancourt | 10:08:00 |
  | m4   | Porte de Clignancourt | 10:02:00 |
  | m4   | Porte de Clignancourt | 10:04:00 |
  | m4   | Porte de Clignancourt | 10:06:00 |
- When the visitor opens the station "nord"
- Then the departures read "4 Porte de Clignancourt: 2 min, 4 min, 6 min"

### Scenario: Twelve lines at most

- Given 13 destinations of the line "m4", one minute apart from 10:01:00
- When the visitor opens the station "nord"
- Then 12 lines of departures are shown

### Scenario: A cancelled departure is left out

- Given these departures
  | line | destination           | at       | status    |
  | ---- | --------------------- | -------- | --------- |
  | m4   | Porte de Clignancourt | 10:02:00 | cancelled |
  | m4   | Porte de Clignancourt | 10:05:00 |           |
- When the visitor opens the station "nord"
- Then the departures read "4 Porte de Clignancourt: 5 min"

### Scenario: A departure gone for more than 30 seconds is left out

- Given these departures
  | line | destination           | at       |
  | ---- | --------------------- | -------- |
  | m4   | Porte de Clignancourt | 09:59:29 |
  | m4   | Porte de Clignancourt | 09:59:30 |
- When the visitor opens the station "nord"
- Then the departures read "4 Porte de Clignancourt: at platform"

### Scenario: The expected time replaces the aimed one

- Given these departures
  | line | destination           | at       | expected at |
  | ---- | --------------------- | -------- | ----------- |
  | m4   | Porte de Clignancourt | 10:02:00 | 10:04:00    |
- When the visitor opens the station "nord"
- Then the departures read "4 Porte de Clignancourt: 4 min"

### Scenario: No departure left

- Given these departures
  | line | destination     | at       |
  | ---- | --------------- | -------- |
  | b38  | Porte d'Orléans | 10:01:00 |
- When the visitor opens the station "nord"
- Then no departure is planned

## Rule: A departure is told at platform, in minutes, or at its time beyond an hour

### Background:

- Given the station "nord" served by these lines
  | id  | route master | ref | colour  | text colour |
  | --- | ------------ | --- | ------- | ----------- |
  | m4  | subway       | 4   | #CF009E | #FFFFFF     |
- And it is 10:00:00

### Scenario Outline: The departure at <at> is told "<told>"

- Given these departures
  | line | destination           | at   |
  | ---- | --------------------- | ---- |
  | m4   | Porte de Clignancourt | <at> |
- When the visitor opens the station "nord"
- Then the departures read "4 Porte de Clignancourt: <told>"

#### Examples:

| at       | told        |
| -------- | ----------- |
| 09:59:40 | at platform |
| 10:00:29 | at platform |
| 10:00:30 | 1 min       |
| 10:02:00 | 2 min       |
| 10:59:29 | 59 min      |
| 10:59:30 | at 10:59:30 |
| 11:20:00 | at 11:20:00 |

## Rule: A line with real-time data says so

### Background:

- Given the station "nord" served by these lines
  | id  | route master | ref | colour  | text colour |
  | --- | ------------ | --- | ------- | ----------- |
  | m4  | subway       | 4   | #CF009E | #FFFFFF     |
  | m5  | subway       | 5   | #FF7E2E | #000000     |
- And it is 10:00:00

### Scenario: One departure in real time is enough

- Given these departures
  | line | destination           | at       | real time |
  | ---- | --------------------- | -------- | --------- |
  | m4   | Porte de Clignancourt | 10:02:00 | no        |
  | m4   | Porte de Clignancourt | 10:05:00 | yes       |
  | m5   | Place d'Italie        | 10:03:00 | no        |
- When the visitor opens the station "nord"
- Then the lines in real time are "4 Porte de Clignancourt"

## Rule: A line's colours are made readable

### Scenario Outline: <text> on <colour> is shown on <shown>

- Given the station "nord" served by these lines
  | id  | route master | ref | colour   | text colour |
  | --- | ------------ | --- | -------- | ----------- |
  | l   | train        | L   | <colour> | <text>      |
- And it is 10:00:00
- And these departures
  | line | destination | at       |
  | ---- | ----------- | -------- |
  | l    | Versailles  | 10:02:00 |
- When the visitor opens the station "nord"
- Then the line "L" is shown in <text> on <shown>

#### Examples:

| colour  | text    | shown   |
| ------- | ------- | ------- |
| #CF009E | #FFFFFF | #cf009e |
| #5091CB | #FFFFFF | #4074a2 |
| #FFCE00 | #000000 | #ffce00 |
| #6E491E | #000000 | #927756 |
| #FFFFFF | #FFFFFF | #ffffff |

### Scenario: A line without colours is grey with white text

- Given the station "nord" served by these lines
  | id  | route master | ref | colour | text colour |
  | --- | ------------ | --- | ------ | ----------- |
  | k   | train        | K   |        |             |
- And it is 10:00:00
- And these departures
  | line | destination     | at       |
  | ---- | --------------- | -------- |
  | k    | Crépy-en-Valois | 10:02:00 |
- When the visitor opens the station "nord"
- Then the line "K" is shown in #FFFFFF on #5b6573

## Rule: The exits are sorted by number and tell their access

### Background:

- Given the station "nord" served by these lines
  | id  | route master | ref | colour  | text colour |
  | --- | ------------ | --- | ------- | ----------- |
  | m4  | subway       | 4   | #CF009E | #FFFFFF     |
- And these exits of the station "nord"
  | ref | name              | wheelchair | conveying |
  | --- | ----------------- | ---------- | --------- |
  | 10  | Boulevard Magenta |            | yes       |
  | 2   | Rue de Maubeuge   | yes        | yes       |
  | 1   | Rue de Dunkerque  |            |           |
  |     | Rue de Compiègne  |            |           |
- And it is 10:00:00
- And these departures
  | line | destination           | at       |
  | ---- | --------------------- | -------- |
  | m4   | Porte de Clignancourt | 10:02:00 |

### Scenario: The exits follow their numbers

- When the visitor opens the station "nord"
- Then the exits read "1 Rue de Dunkerque; 2 Rue de Maubeuge, accessible; 10 Boulevard Magenta, escalator; Rue de Compiègne"

## Rule: The departures are asked again while the sheet of the station is open and shown

### Background:

- Given the station "nord" served by these lines
  | id  | route master | ref | colour  | text colour |
  | --- | ------------ | --- | ------- | ----------- |
  | m4  | subway       | 4   | #CF009E | #FFFFFF     |
- And it is 10:00:00
- And these departures
  | line | destination           | at       |
  | ---- | --------------------- | -------- |
  | m4   | Porte de Clignancourt | 10:04:35 |

### Scenario: The departures are asked once the station opens

- When the visitor opens the station "nord"
- Then the departures were asked 1 time

### Scenario: The departures are asked again every 30 seconds

- When the visitor opens the station "nord"
- And it is 10:00:29
- And it is 10:00:30
- And it is 10:01:00
- Then the departures were asked 3 times

### Scenario: The minutes count down every 10 seconds without asking again

- When the visitor opens the station "nord"
- And it is 10:00:20
- Then the departures read "4 Porte de Clignancourt: 4 min"
- And the departures were asked 1 time

### Scenario: The time does not move between two steps of 10 seconds

- When the visitor opens the station "nord"
- And it is 10:00:09
- Then the departures read "4 Porte de Clignancourt: 5 min"

### Scenario: New departures replace the former ones

- When the visitor opens the station "nord"
- And these departures
  | line | destination           | at       |
  | ---- | --------------------- | -------- |
  | m4   | Porte de Clignancourt | 10:06:30 |
- And it is 10:00:30
- Then the departures read "4 Porte de Clignancourt: 6 min"

### Scenario: Nothing is asked once the sheet is closed

- When the visitor opens the station "nord"
- And the visitor closes the station
- And it is 10:01:00
- Then the departures were asked 1 time

### Scenario: The closed sheet shows no station

- When the visitor opens the station "nord"
- And the visitor closes the station
- Then no station is shown

### Scenario: Nothing is asked while the page is hidden

- When the visitor opens the station "nord"
- And the page is hidden
- And it is 10:01:00
- Then the departures were asked 1 time

### Scenario: The departures are asked again at once when the page is shown again

- When the visitor opens the station "nord"
- And the page is hidden
- And it is 10:00:10
- And the page is shown
- Then the departures were asked 2 times

### Scenario: A place that is not a station shows no station

- When the visitor opens the station "flore"
- Then no station is shown

## Rule: A failure of the departures service says so, until it answers again

### Background:

- Given the station "nord" served by these lines
  | id  | route master | ref | colour  | text colour |
  | --- | ------------ | --- | ------- | ----------- |
  | m4  | subway       | 4   | #CF009E | #FFFFFF     |
- And it is 10:00:00
- And the departures service fails

### Scenario: The departures cannot be known

- When the visitor opens the station "nord"
- Then the departures are unavailable

### Scenario: The service answers again at the next asking

- When the visitor opens the station "nord"
- And these departures
  | line | destination           | at       |
  | ---- | --------------------- | -------- |
  | m4   | Porte de Clignancourt | 10:05:00 |
- And it is 10:00:30
- Then the departures read "4 Porte de Clignancourt: 5 min"

### Scenario: The exits stay shown

- Given these exits of the station "nord"
  | ref | name             | wheelchair | conveying |
  | --- | ---------------- | ---------- | --------- |
  | 1   | Rue de Dunkerque |            |           |
- When the visitor opens the station "nord"
- Then the exits read "1 Rue de Dunkerque"
