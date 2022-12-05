import Airtable from "airtable";

export default async (req, res) => {
  let option = req.query.option;
  let data = {};

   if (
    option?.[0].indexOf("photo") >= 0 &&
    option?.[1].indexOf("save") >= 0
   ) {
    try {
      Airtable
        .base('appbo8nzfBdKwOEoo')('photos')
        .create([
          {
            fields: {
              ...req.body,
            },
          }
        ], (err, records) => {
          if (err) {
            console.error(err);
            return;
          }
          data = records.map(el => el.getId())
          res.status(200).json(data);
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Something went wrong! 😕" });
      }
  } else if (option?.[0].indexOf("photo") >= 0) {
    try {
      data = await Airtable
        .base('appbo8nzfBdKwOEoo')('photos')
        .select({
          view: "Grid view",
          filterByFormula: `{album_id} = '${option?.[1]}'`,
        })
        .firstPage();
      data = data.map(el => el.fields)
      res.status(200).json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Something went wrong! 😕" });
    }
  } else {
    res.status(404).json({ msg: "Something went wrong! 😕" });
  }
}