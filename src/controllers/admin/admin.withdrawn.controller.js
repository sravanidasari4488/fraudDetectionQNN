import supabase from "../../db/supabaseClient.js";
import { ApiError } from "../../utils/ApiError.js";

export const withdrawn = async(req, res) =>{
    const tm_id = req.query.tm_id;
    const { withdrawn, remarks } = req.body;

     if (!tm_id || !withdrawn) {
       return res
         .status(400)
         .json(new ApiError(400, "tm_id and withdrawn amount required"));
     }

     // Validate that withdrawn amount is positive
     if (parseFloat(withdrawn) <= 0) {
       return res
         .status(400)
         .json(new ApiError(400, "Withdrawn amount must be greater than 0"));
     }

    try{
      // First, get the current wallet balance to ensure sufficient funds
      const { data: currentData, error: fetchError } = await supabase
        .schema("onlyclick")
        .from("taskmaster")
        .select("wallet, withdrawn")
        .eq("tm_id", tm_id)
        .maybeSingle();

      if (fetchError) throw new ApiError(500, fetchError.message);
      
      if (!currentData) {
        throw new ApiError(404, "Taskmaster not found");
      }

      // Check if sufficient balance exists
      if (currentData.wallet < withdrawn) {
        throw new ApiError(400, "Insufficient wallet balance");
      }

      // Calculate new wallet balance
      const previousWalletBalance = currentData.wallet;
      const newWalletBalance = currentData.wallet - parseFloat(withdrawn);
      const withdrawnAmount = parseFloat(withdrawn);

      console.log("Processing withdrawal:", {
        tm_id,
        previousWalletBalance,
        withdrawnAmount,
        newWalletBalance
      });

      // Update both withdrawn and wallet
      const { data, error } = await supabase
        .schema("onlyclick")
        .from("taskmaster")
        .update({
          withdrawn: (currentData.withdrawn) + withdrawnAmount,
          wallet: newWalletBalance,
        })
        .eq("tm_id", tm_id)
        .select("withdrawn, wallet")
        .maybeSingle();

      if (error) {
        console.error("Wallet update error:", error);
        throw new ApiError(500, error.message);
      }

      console.log("Wallet updated successfully:", data);

      // Insert transaction record into taskmaster_tm table with wallet balance tracking
      const { data: transactionData, error: transactionError } = await supabase
        .schema("onlyclick")
        .from("transactions_tm")
        .insert({
          tm_id: tm_id,
          type: "debit",
          direction: "tm_wallet to tm",
          amount: withdrawnAmount,
          remarks: remarks || "Wallet withdrawal req processed by admin",
          wallet_balance: newWalletBalance,
          previous_wallet_balance: previousWalletBalance
        })
        .select()
        .maybeSingle();

      if (transactionError) {
        console.error('Transaction insert error:', transactionError);
        // Continue execution even if transaction insert fails
      }

      console.log("Transaction inserted successfully:", transactionData);

      return res.status(200).json({
        updatedRecord: data,
        transactionRecord: transactionData,
      });
    }catch(error){
      console.log(error);
        return res.status(404).json(new ApiError(404, error.message));
    }
}