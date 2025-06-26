We have the following issues that need improvement. Lets tackle them one step at a time. 
You can ask any questions or clarifications you need before implementing each step so that we are aligned. 
I am not an expert in implementation so you will need to align with me before implementing.

Step 1
General
1. In line charts, make the lines straight instead of curved.
2. In line/bar/table charts, when the timeline button changes to week, monthy, quarter, year, in the x-axis only the values corresponding to the selected time period in Date range should be shown and data should be filtered accordingly
3. Instead of "Άνδρας" and "Γυναίκα" in the Greek translation use "Άνδρες" and "Γυναίκες"
 
Step 2
Dashboard
1. The hover on the charts should be like Έμπορος: Value (percentage change from last year) and below it Ανταγωνισμός: Value (percentage change from last year)
2. The TransactionsChart, RevenueChart and CustomersChart should be renamed to Transactions, Revenue and Customers respectively.
3. In CustomersChart remove the "* Έμπορος data only (compliance requirement)"
4. For the dashboardMetrics, first show totalRevenue, then totalTransactions and then avgTransaction
5. Show each dashboardMetric in one component, as you have done in each of the competitionMetrics
 
Step 3
Revenue
1. The hover on the revenueTrend chart should be like Έμπορος: Value (percentage change from last year) and below it Ανταγωνισμός: Value (percentage change from last year)
2. In RevenueByInterests and RevenueByChannel charts, the selection between types of chart should be on the upper right side (as it is on all other charts)
3. In RevenueByInterests there is overflow in the labels of x-axis (shopping interest) that needs to be fixed, perhaps with wrapping or please make suggestions with what you think is best
4. In RevenueByChannel there are problems with the pieChart selection: 
	a. when you select it, it is shown as chartOptions.pie
	b. There should be different colors between Physical Stores and E-Commerce (same for both merchant and competition)
	c. There is overflow on the labels for each angle that needs to be fixed, perhaps with wrapping or please make suggestions with what you think is best
	d. Replace the Bars option with a stackedBar option like the one used at the CustomersByGender chart with same colors for Physical Stores and same color for E-commerce for both merchant and competition
5. For the three goForMore revenueMetrics (totalRevenue, totalRewarded, totalRedeemed), they should be shown in one component with a common title "Go For More" and subtitles "Total Revenue", "Total Rewarded Amount" and "Total Redeemed Amount" respectively.
6. For each of the following revenueMetrics: totalRevenue, avgDailyRevenue, avgTransaction show in one component, as you have done in each of the competitionMetrics
 
Step 4
Demographics
1. Change the Greek subtitle translation to: Δημογραφικά και καταναλωτική συμπεριφορά των πελατών
2. Replace in the genderChart the "Δεδομένα εμπόρου μόνο (απαίτηση συμμόρφωσης)" with "Percentage of customers by gender. Absolute values shown for merchant only."
3. In genderChart and ageGroupChart, when we select Table we should also see the absolute number of customers for the merchant (like they appear in ShoppingFrequencyChart)
4. In ShoppingInterestsChart, when we select table we should wrap or make smaller the Shopping Interests values so the table doesn't need scrolling to show all values
5. In genderChart remove the Bars option selection and add the pie chart like in RevenueByChannel chart, using the same colors for Male, Female as you use in the Stacked Bar option