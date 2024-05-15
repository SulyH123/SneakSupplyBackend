const array = [
    {
      _id: "6572403fb0a8fa4c32ff48bb",
      user: {
        profile_img: [],
        id: "65507001e13fb144fc2aaa30",
        name: 'Muhammad moiz'
      },
      course: "6563a748c33062009dd6005d",
      rating: 5,
      comment: 'Great, totally worth it',
      __v: 0
    }
  ];
  
  let userid = "65507001e13fb144fc2aaa30";
  const even = (user) => user.user.id === userid; // Use === for string comparison
  
  console.log(array.some(even));
  