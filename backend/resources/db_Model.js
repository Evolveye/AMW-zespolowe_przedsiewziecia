db.userModule.aggregate(
  {
    $match: {
      id: {
        $in: [
          "1612547183345t9011626731200102r",
          "1612547193563t31859588080962276r",
          "1612547167424t07967622315769174r",
        ],
      },
    },
  },
  {
    $lookup: {
      from: "groupModule.permissions.users",
	  pipeline: [
		{
		  $match: {
			$and: [
			  { referenceId: "1612547204620t7800678002538672r" }, 
			//   { userId: "$id" },
			],
		  },
		},
	  ],
      as: "permsUser",
    },
  }
);
