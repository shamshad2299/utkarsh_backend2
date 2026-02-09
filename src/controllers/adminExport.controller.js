import XLSX from "xlsx";
import { Registration } from "../models/registerations.model.js";

export const exportRegistrationsExcel = async (req, res) => {
    try {
        const { type = "all" } = req.query;

        const registrations = await Registration.find({ isDeleted: false })
            .populate({
                path: "eventId",
                select: "title",
                populate: [
                    { path: "category", select: "name" },
                ],
            })
            .populate(
                "userId",
                "userId name email mobile_no college course"
            )
            .populate({
                path: "teamId",
                populate: [
                    { path: "teamLeader", select: "userId name" },
                    { path: "teamMembers", select: "name" },
                ],
            });

        const soloData = [];
        const teamData = [];

        // let soloCounter = 1;
        // let teamCounter = 1;

        registrations.forEach((reg) => {
            const category = reg.eventId?.category?.name || "";
            const eventTitle = reg.eventId?.title || "";

            const formattedDate = new Date(reg.createdAt).toLocaleString("en-IN");

            if (!reg.teamId) {
                soloData.push({
                    // SNo: soloCounter++,
                    Category: category,
                    Event: eventTitle,
                    UserID: reg.userId?.userId,
                    Name: reg.userId?.name,
                    Email: reg.userId?.email,
                    Mobile: reg.userId?.mobile_no,
                    College: reg.userId?.college,
                    Course: reg.userId?.course,
                    PaymentStatus: reg.paymentStatus,
                    RegisteredAt: formattedDate,
                });
            } else {
                teamData.push({
                    // SNo: teamCounter++,
                    Category: category,
                    Event: eventTitle,
                    TeamName: reg.teamId?.teamName,
                    LeaderID: reg.teamId?.teamLeader?.userId,
                    LeaderName: reg.teamId?.teamLeader?.name,
                    Members: reg.teamId?.teamMembers
                        ?.map((m) => m.name)
                        .join(", "),
                    PaymentStatus: reg.paymentStatus,
                    RegisteredAt: formattedDate,
                });
            }
        });


        const sorter = (a, b) =>
            a.Category.localeCompare(b.Category) ||
            a.Event.localeCompare(b.Event);

        soloData.sort(sorter);
        teamData.sort(sorter);

        if (soloData.length > 0) {
            soloData.push({});
            soloData.push({
                // SNo: "",
                Category: "",
                Event: "",
                UserID: "",
                Name: "",
                Email: "",
                Mobile: "",
                College: "",
                Course: "",
                PaymentStatus: "",
                RegisteredAt: "",
            });
            // soloData.push({
            //     // SNo: "",
            //     Category: "Total Registrations:",
            //     Event: soloData.length,
            // });
        }

        if (teamData.length > 0) {
            teamData.push({});
            // teamData.push({
            //     // SNo: "",
            //     Category: "Total Registrations:",
            //     Event: teamData.length,
            // });
        }

        const autoFitColumns = (worksheet, data) => {
            const columnWidths = [];

            data.forEach((row) => {
                Object.keys(row).forEach((key, index) => {
                    const value = row[key] ? row[key].toString() : "";
                    columnWidths[index] = Math.max(
                        columnWidths[index] || 10,
                        value.length + 2
                    );
                });
            });

            worksheet["!cols"] = columnWidths.map((width) => ({
                wch: width,
            }));
        };



        const workbook = XLSX.utils.book_new();

        if (type === "solo" || type === "all") {
            const soloSheet = XLSX.utils.json_to_sheet(soloData);
            autoFitColumns(soloSheet, soloData);
            XLSX.utils.book_append_sheet(workbook, soloSheet, "Solo Registrations");
        }

        if (type === "team" || type === "all") {
            const teamSheet = XLSX.utils.json_to_sheet(teamData);
            autoFitColumns(teamSheet, teamData);
            XLSX.utils.book_append_sheet(workbook, teamSheet, "Team Registrations");
        }


        const buffer = XLSX.write(workbook, {
            type: "buffer",
            bookType: "xlsx",
        });

        let filename = "registrations.xlsx";

        if (type === "solo") filename = "solo-registrations.xlsx";
        if (type === "team") filename = "team-registrations.xlsx";
        if (type === "all") filename = "all-registrations.xlsx";

        res.setHeader(
            "Content-Disposition",
            `attachment; filename=${filename}`
        );

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.send(buffer);

    } catch (error) {
        console.error("Excel Export Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to export registrations",
        });
    }
};
