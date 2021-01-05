// user
{
	login:string,
	password:IDK,  //  >>>>>>>>>>>>>>
	activated:boolean,
	name:string,
	surname:string,
	email:string,
	created:number,
	avatar:string,
}

//group
{
	nazwa, 
	lista userow,
}

// meeting
{
	participants:list<{user}>,// user, group
	chat:{chat},
	when:number,
}


// platform
// userw przyp. do grupy 
{
	owner:{user},
	created:number,
	assignedGroup:{group},
	administrator:{user},
	assigned_users:{list<users>},
	org_name:string,
}

//Message
{
	text:string,
	sender:{user},
	when:number
}

//notes
{
	redived:number,
	note:number,
	description:string,
}

//role
{
	name:string,
	canInvate:boolean,
	canDelete:boolean,
	canMute:boolean,
	editNotes:boolean,
	insertNotes:boolean,
}
